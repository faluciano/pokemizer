import type { GameVersion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface GameHeaderProps {
  gameVersion: GameVersion;
}

export function GameHeader({ gameVersion }: GameHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-white">
          {gameVersion.displayName}
        </h2>
        <Badge variant="secondary" className="text-xs">
          {gameVersion.region}
        </Badge>
      </div>
    </div>
  );
}
