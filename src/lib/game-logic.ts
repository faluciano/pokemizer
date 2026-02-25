import type { Pokemon, PokemonType } from "./types";

export const MAX_TEAM_SIZE = 6;
export const MAX_ATTEMPTS = 30;

/** Returns the list of types that overlap between the new pokemon and existing team */
export function getTypeOverlap(team: Pokemon[], newPokemon: Pokemon): PokemonType[] {
  const teamTypes = new Set(team.flatMap((p) => p.types));
  return newPokemon.types.filter((t) => teamTypes.has(t));
}

/** Returns true if the pokemon can be auto-added (no type overlap and not a duplicate) */
export function canAutoAdd(team: Pokemon[], newPokemon: Pokemon): boolean {
  const isDuplicate = team.some((p) => p.id === newPokemon.id);
  if (isDuplicate) return false;
  return getTypeOverlap(team, newPokemon).length === 0;
}

/** Returns true if the revealed pokemon is a duplicate of one already on the team */
export function isDuplicate(team: Pokemon[], pokemon: Pokemon): boolean {
  return team.some((p) => p.id === pokemon.id);
}

export function isTeamFull(team: Pokemon[]): boolean {
  return team.length >= MAX_TEAM_SIZE;
}

export function isGameOver(team: Pokemon[], attempts: number): boolean {
  return isTeamFull(team) || attempts >= MAX_ATTEMPTS;
}

/** Get unique types covered by the team */
export function getTeamTypes(team: Pokemon[]): PokemonType[] {
  return [...new Set(team.flatMap((p) => p.types))];
}

/** Calculate a simple type coverage score (out of 18) */
export function getTypeCoverage(team: Pokemon[]): number {
  return getTeamTypes(team).length;
}

/** Returns indices of team members that share at least one type with the new pokemon */
export function getOverlappingTeamIndices(team: Pokemon[], newPokemon: Pokemon): number[] {
  const newTypes = new Set(newPokemon.types);
  return team
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => member.types.some((t) => newTypes.has(t)))
    .map(({ index }) => index);
}
