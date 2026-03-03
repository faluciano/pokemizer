"use client";

import Link from "next/link";
import type { EvolutionLine, Generation, GameVersion } from "@/lib/types";
import { getTypeCoverage } from "@/lib/game-logic";
import { EvolutionStageViewer } from "@/components/evolution-stage-viewer";
import { ShareButton } from "@/components/share-button";
import { ImportButton } from "@/components/import-button";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface SharedTeamViewProps {
  gameVersion: GameVersion;
  generation: Generation;
  team: EvolutionLine[];
  attempts: number;
}

export function SharedTeamView({
  gameVersion,
  generation,
  team,
  attempts,
}: SharedTeamViewProps) {
  const coverage = getTypeCoverage(team);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          Shared Team
        </p>
        <h2 className="mt-2 text-4xl font-bold text-white">
          {gameVersion.displayName}
        </h2>
        <p className="mt-2 text-lg text-zinc-400">
          {gameVersion.region}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {coverage}/18 types covered &middot; {attempts} attempts used
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {team.map((line) => (
          <div
            key={`${line.lineId}-${line.branchIndex ?? "base"}`}
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

      <div className="flex flex-wrap justify-center gap-3">
        <ImportButton
          gameVersion={gameVersion}
          generation={generation}
          team={team}
          attempts={attempts}
        />
        <ShareButton
          gameVersion={gameVersion}
          team={team}
          attempts={attempts}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <Link href={`/play/${gameVersion.slug}`}>
          <Button variant="ghost" size="sm">
            Play {gameVersion.displayName}
          </Button>
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline transition-colors"
        >
          Go to Pokemizer
        </Link>
      </div>
    </div>
  );
}
