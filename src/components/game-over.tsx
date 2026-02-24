"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Pokemon, Generation, TeamHistoryEntry } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MAX_TEAM_SIZE, getTypeCoverage } from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface GameOverProps {
  team: Pokemon[];
  attempts: number;
  maxAttempts: number;
  generation: Generation;
  onPlayAgain: () => void;
  onNewGeneration: () => void;
}

export function GameOver({
  team,
  attempts,
  maxAttempts,
  generation,
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
      team,
      attempts,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev]);
  }, [generation, team, attempts, setHistory]);

  const isComplete = team.length >= MAX_TEAM_SIZE;
  const typesCovered = getTypeCoverage(team);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white">
          {isComplete ? "Team Complete!" : "Game Over!"}
        </h2>
        <p className="mt-2 text-lg text-zinc-400">
          {generation.displayName} &middot; {generation.region}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {team.map((pokemon) => (
          <div
            key={pokemon.id}
            className="relative flex w-[130px] flex-col items-center rounded-xl border border-zinc-700 bg-zinc-800/50 p-3"
          >
            {pokemon.isStarter && (
              <div className="absolute -top-1.5 -right-1.5 rounded-full bg-yellow-500 p-0.5">
                <Star className="size-3 fill-white text-white" />
              </div>
            )}
            <div className="relative h-[80px] w-[80px]">
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
            <p className="mt-1 text-sm font-semibold text-white">
              {capitalize(pokemon.name)}
            </p>
            <div className="mt-1 flex gap-0.5">
              {pokemon.types.map((type) => (
                <TypeBadge
                  key={type}
                  type={type}
                  className="text-[9px] px-1 py-0"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-white">{attempts}</p>
          <p className="text-xs text-zinc-400">
            of {maxAttempts} attempts used
          </p>
        </div>
        <div className="h-12 w-px bg-zinc-700" />
        <div>
          <p className="text-2xl font-bold text-white">{team.length}</p>
          <p className="text-xs text-zinc-400">of {MAX_TEAM_SIZE} Pokemon</p>
        </div>
        <div className="h-12 w-px bg-zinc-700" />
        <div>
          <p className="text-2xl font-bold text-white">{typesCovered}</p>
          <p className="text-xs text-zinc-400">of 18 types covered</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button size="lg" onClick={onPlayAgain}>
          Play Again (Same Gen)
        </Button>
        <Button size="lg" variant="outline" onClick={onNewGeneration}>
          Pick New Generation
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
