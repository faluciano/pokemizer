import type { EvolutionLine, GameVersion, Generation } from "@/lib/types";
import { getGameData } from "@/data";
import { getGameVersion, getGenerationForGame } from "@/lib/games";
import { decodeShareCode } from "@/lib/share";

// ---------------------------------------------------------------------------
// Resolve (full data lookup)
//
// ⚠️ Server-only: this module imports the full `@/data` barrel (all games).
// Keep it out of client component graphs so the ~2.9MB data chunk is never
// shipped to the browser. Import it only from server components / route
// handlers (e.g. `t/[code]/page.tsx`).
// ---------------------------------------------------------------------------

export interface ResolvedShareData {
  gameVersion: GameVersion;
  generation: Generation;
  team: EvolutionLine[];
  attempts: number;
}

/** Decode + resolve full EvolutionLine objects from static game data. Returns null on any failure. */
export function resolveShareCode(code: string): ResolvedShareData | null {
  const payload = decodeShareCode(code);
  if (!payload) return null;

  // 1. getGameData must return data
  const data = getGameData(payload.gameSlug);
  if (!data) return null;

  // 2. Each member must be found in game data
  const team: EvolutionLine[] = [];
  for (const ref of payload.members) {
    const line = data.find(
      (l) =>
        l.lineId === ref.lineId &&
        (ref.branchIndex === undefined
          ? l.branchIndex === undefined
          : l.branchIndex === ref.branchIndex),
    );
    if (!line) return null;
    team.push(line);
  }

  // 3. getGameVersion and getGenerationForGame must return values
  const gameVersion = getGameVersion(payload.gameSlug);
  if (!gameVersion) return null;

  const generation = getGenerationForGame(gameVersion);
  if (!generation) return null;

  return {
    gameVersion,
    generation,
    team,
    attempts: payload.attempts,
  };
}
