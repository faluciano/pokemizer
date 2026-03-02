import type { GameVersion } from "@/lib/types";
import { MAX_TEAM_SIZE, ALL_TYPES_COUNT } from "@/lib/game-logic";
import { Badge } from "@/components/ui/badge";

interface GameHeaderProps {
  gameVersion: GameVersion;
  teamSize: number;
  attempts: number;
  typeCoverage: number;
}

export function GameHeader({
  gameVersion,
  teamSize,
  attempts,
  typeCoverage,
}: GameHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-white">
          {gameVersion.displayName}
        </h2>
        <Badge variant="secondary" className="text-xs">
          {gameVersion.region}
        </Badge>
      </div>

      <div className="flex items-center text-sm">
        <div>
          <span className="text-zinc-400">Team </span>
          <span className="font-semibold text-white">
            {teamSize}/{MAX_TEAM_SIZE}
          </span>
        </div>
        <div className="ml-3 border-l border-zinc-700 pl-3">
          <span className="text-zinc-400">Picks </span>
          <span className="font-semibold text-white">{attempts}</span>
        </div>
        <div className="ml-3 border-l border-zinc-700 pl-3">
          <span className="text-zinc-400">Types </span>
          <span className="font-semibold text-white">
            {typeCoverage}/{ALL_TYPES_COUNT}
          </span>
        </div>
      </div>
    </div>
  );
}
