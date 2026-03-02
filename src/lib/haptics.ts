/**
 * Trigger haptic feedback on supported devices.
 * Falls back silently on unsupported devices / desktop browsers.
 */
export function haptic(pattern: "light" | "medium" | "heavy" | "error" = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  switch (pattern) {
    case "light":
      navigator.vibrate(10);
      break;
    case "medium":
      navigator.vibrate(25);
      break;
    case "heavy":
      navigator.vibrate(50);
      break;
    case "error":
      navigator.vibrate([30, 50, 30]);
      break;
  }
}
