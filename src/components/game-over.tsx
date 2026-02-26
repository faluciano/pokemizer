"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { EvolutionLine, Generation, GameVersion, TeamHistoryEntry } from "@/lib/types";
import { getTypeCoverage } from "@/lib/game-logic";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { EvolutionStageViewer } from "@/components/evolution-stage-viewer";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface GameOverProps {
  team: EvolutionLine[];
  attempts: number;
  generation: Generation;
  gameVersion: GameVersion;
  onPlayAgain: () => void;
  onNewGeneration: () => void;
}

export function GameOver({
  team,
  attempts,
  generation,
  gameVersion,
  onPlayAgain,
  onNewGeneration,
}: GameOverProps) {
  const [history, setHistory] = useLocalStorage<TeamHistoryEntry[]>("team-history", []);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const entry: TeamHistoryEntry = {
      generation,
      gameVersion,
      team,
      attempts,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev]);
  }, [generation, gameVersion, team, attempts, setHistory]);

  const coverage = getTypeCoverage(team);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white">
          Game Over!
        </h2>
        <p className="mt-2 text-lg text-zinc-400">
          {gameVersion.displayName} &middot; {gameVersion.region}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {coverage}/18 types covered &middot; {attempts} attempts used
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {team.map((line) => (
            <div
              key={line.lineId}
              className="relative flex w-[170px] flex-col items-center rounded-xl border border-zinc-700 bg-zinc-800/50 p-3"
            >
              {line.isStarter && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-yellow-500 p-0.5">
                  <Star className="size-3 fill-white text-white" />
                </div>
              )}
              <EvolutionStageViewer line={line} size="lg" />
            </div>
          ))}
      </div>

      <div className="flex gap-3">
        <Button size="lg" onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button size="lg" variant="outline" onClick={onNewGeneration}>
          Pick New Game
        </Button>
      </div>

      <Link
        href="/history"
        className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline transition-colors"
      >
        View Team History
      </Link>
    </div>
  );
}
