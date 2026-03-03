"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { EvolutionLine, Generation, GameVersion, TeamHistoryEntry } from "@/lib/types";

interface ImportButtonProps {
  gameVersion: GameVersion;
  generation: Generation;
  team: EvolutionLine[];
  attempts: number;
  className?: string;
}

export function ImportButton({
  gameVersion,
  generation,
  team,
  attempts,
  className,
}: ImportButtonProps) {
  const [, setHistory] = useLocalStorage<TeamHistoryEntry[]>("team-history", []);
  const [saved, setSaved] = useState(false);

  const handleImport = () => {
    const entry: TeamHistoryEntry = {
      generation,
      gameVersion,
      team,
      attempts,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev]);
    setSaved(true);
    toast.success("Team saved to your history!");
  };

  return (
    <Button
      onClick={handleImport}
      disabled={saved}
      variant={saved ? "ghost" : "default"}
      className={cn(className)}
    >
      {saved ? (
        <>
          <Check className="mr-2 size-4" />
          Saved
        </>
      ) : (
        <>
          <Download className="mr-2 size-4" />
          Save to My History
        </>
      )}
    </Button>
  );
}
