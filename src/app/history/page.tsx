"use client";

import Image from "next/image";
import Link from "next/link";
import type { TeamHistoryEntry } from "@/lib/types";
import { getTypeCoverage, MAX_TEAM_SIZE } from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TypeBadge } from "@/components/type-badge";
import { StatChart } from "@/components/stat-chart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useLocalStorage<TeamHistoryEntry[]>("team-history", []);

  const clearHistory = () => {
    setHistory([]);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Team History</h1>
            <p className="text-sm text-zinc-400">
              {history.length} {history.length === 1 ? "team" : "teams"} saved
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearHistory}>
            <Trash2 className="mr-2 size-4" />
            Clear History
          </Button>
        )}
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg text-zinc-400">No teams saved yet.</p>
          <p className="text-sm text-zinc-500">Play a game to build your first team!</p>
          <Link href="/">
            <Button>Start Playing</Button>
          </Link>
        </div>
      )}

      {/* History entries */}
      <div className="flex flex-col gap-4">
        {history.map((entry, index) => {
          const typesCovered = getTypeCoverage(entry.team);
          return (
            <div
              key={`${entry.date}-${index}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {entry.generation.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {entry.generation.region} &middot; {formatDate(entry.date)}
                  </p>
                </div>
                <div className="flex gap-4 text-center text-xs text-zinc-400">
                  <div>
                    <p className="text-sm font-bold text-white">{entry.attempts}</p>
                    <p>attempts</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{entry.team.length}/{MAX_TEAM_SIZE}</p>
                    <p>team</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{typesCovered}/18</p>
                    <p>types</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {entry.team.map((pokemon) => (
                  <div key={pokemon.id} className="flex flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <p className="text-[10px] font-medium text-zinc-300">
                      {capitalize(pokemon.name)}
                    </p>
                    <div className="flex gap-0.5">
                      {pokemon.types.map((type) => (
                        <TypeBadge
                          key={type}
                          type={type}
                          className="text-[8px] px-0.5 py-0"
                        />
                      ))}
                    </div>
                    {pokemon.stats && (
                      <StatChart
                        stats={pokemon.stats}
                        primaryType={pokemon.types[0]}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
