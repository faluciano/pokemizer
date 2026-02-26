import type { EvolutionLine, PokemonType } from "./types";

export const MAX_TEAM_SIZE = 6;
export const ALL_TYPES_COUNT = 18;

/** Returns the list of types that overlap between the new line and existing team */
export function getTypeOverlap(team: EvolutionLine[], line: EvolutionLine): PokemonType[] {
  const teamTypes = new Set(team.flatMap((l) => l.types));
  return line.types.filter((t) => teamTypes.has(t));
}

/** Returns true if the evolution line is already on the team (by lineId) */
export function isDuplicate(team: EvolutionLine[], line: EvolutionLine): boolean {
  return team.some((l) => l.lineId === line.lineId);
}

export function isTeamFull(team: EvolutionLine[]): boolean {
  return team.length >= MAX_TEAM_SIZE;
}

/** Game over if team is full OR pool is exhausted */
export function isGameOver(team: EvolutionLine[], poolExhausted: boolean = false): boolean {
  return isTeamFull(team) || poolExhausted;
}

/** Get unique types covered by the team (using base form types) */
export function getTeamTypes(team: EvolutionLine[]): PokemonType[] {
  return [...new Set(team.flatMap((l) => l.types))];
}

/** Calculate type coverage score (out of 18) */
export function getTypeCoverage(team: EvolutionLine[]): number {
  return getTeamTypes(team).length;
}

/** Returns indices of team members that share at least one type with the new line */
export function getOverlappingTeamIndices(team: EvolutionLine[], line: EvolutionLine): number[] {
  const newTypes = new Set(line.types);
  return team
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => member.types.some((t) => newTypes.has(t)))
    .map(({ index }) => index);
}

/** Calculate type coverage delta if this line were added to the team */
export function getTypeCoverageDelta(
  team: EvolutionLine[],
  line: EvolutionLine
): { before: number; after: number; delta: number } {
  const before = getTypeCoverage(team);
  const currentTypes = new Set(getTeamTypes(team));
  for (const t of line.types) {
    currentTypes.add(t);
  }
  const after = currentTypes.size;
  return { before, after, delta: after - before };
}

/** Determine what actions are available for the revealed line */
export function getActionScenario(
  team: EvolutionLine[],
  line: EvolutionLine
): "add" | "add-with-overlap" | "replace-or-skip" {
  if (isTeamFull(team)) {
    return "replace-or-skip";
  }
  const overlap = getTypeOverlap(team, line);
  if (overlap.length > 0) {
    return "add-with-overlap";
  }
  return "add";
}

/** Returns indices of team members that can be replaced (non-starters) */
export function getReplaceableIndices(team: EvolutionLine[]): number[] {
  return team
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => !member.isStarter)
    .map(({ index }) => index);
}

/** Check if a specific lineId is already on the team */
export function isLineOnTeam(team: EvolutionLine[], lineId: number): boolean {
  return team.some((l) => l.lineId === lineId);
}
