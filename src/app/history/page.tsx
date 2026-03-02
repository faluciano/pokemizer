"use client";

import Link from "next/link";
import type { TeamHistoryEntry, EvolutionLine } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { EvolutionStageViewer } from "@/components/evolution-stage-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

// --- History migration helpers ---

function migrateOldPokemon(pokemon: any): EvolutionLine {
  return {
    lineId: pokemon.id,
    stages: [{
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      sprite: pokemon.sprite,
      stats: pokemon.stats,
      stage: 0,
    }],
    types: pokemon.types,
    isStarter: pokemon.isStarter ?? false,
  };
}

function isLegacyEntry(entry: any): boolean {
  return entry.team?.length > 0 && !('lineId' in entry.team[0]);
}

function migrateEntry(entry: any): TeamHistoryEntry {
  if (isLegacyEntry(entry)) {
    return {
      ...entry,
      team: entry.team.map(migrateOldPokemon),
    };
  }
  return entry as TeamHistoryEntry;
}

// --- Page component ---

export default function HistoryPage() {
  const [rawHistory, setRawHistory] = useLocalStorage<any[]>("team-history", []);
  const history: TeamHistoryEntry[] = rawHistory.map(migrateEntry);

  const clearHistory = () => {
    setRawHistory([]);
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
          return (
            <div
              key={`${entry.date}-${index}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {entry.gameVersion?.displayName ?? entry.generation.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {(entry.gameVersion?.region ?? entry.generation.region)} &middot; {formatDate(entry.date)}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap gap-3">
                {entry.team.map((line) => (
                  <div key={line.lineId} className="flex w-[130px] flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
                    <EvolutionStageViewer line={line} size="sm" />
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
