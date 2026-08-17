"use client";

import { useState, useCallback, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Start with initialValue and read localStorage after mount, so the first
  // client render matches the server-rendered HTML (avoids hydration errors).
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync from localStorage
      if (item !== null) setStoredValue(JSON.parse(item));
    } catch {
      // Ignore unreadable/corrupt values and keep initialValue.
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (error) {
          console.warn(`Error writing localStorage key "${key}":`, error);
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
