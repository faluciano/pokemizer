export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  isStarter: boolean;
  stats: BaseStats;
}

export interface EvolutionStage {
  id: number;          // National dex ID
  name: string;        // Lowercase from PokeAPI
  types: PokemonType[];
  sprite: string;
  stats: BaseStats;
  stage: number;       // 0 = base, 1 = mid, 2 = final
}

export interface EvolutionLine {
  lineId: number;      // Base form species ID (unique per evolution chain)
  stages: EvolutionStage[];
  types: PokemonType[];   // Base form types (always === stages[0].types)
  isStarter: boolean;
  branchIndex?: number;   // Only for Eevee-style branches
}

export interface Generation {
  id: number;
  name: string;
  displayName: string;
  region: string;
  starterIds: number[];
}

export interface GameVersion {
  /** Unique slug used in routing, e.g. "firered-leafgreen" */
  slug: string;
  /** Pretty display name shown in UI */
  displayName: string;
  /** Which generation this game belongs to (for grouping in UI) */
  generationId: number;
  /** Region name for display */
  region: string;
  /** PokeAPI pokedex ID(s) to fetch the pokemon pool */
  pokedexIds: number[];
  /** Starter pokemon national dex IDs for this game */
  starterIds: number[];
  /** Individual game names within this version group */
  games: string[];
}

export type GamePhase =
  | "picking-generation"
  | "starter-reveal"
  | "playing"
  | "game-over";

export interface GameState {
  phase: GamePhase;
  generation: Generation | null;
  gameVersion: GameVersion | null;
  team: EvolutionLine[];
  attempts: number;
  currentCards: EvolutionLine[];
  revealedIndex: number | null;
  allPokemon: EvolutionLine[];
  excludedLineIds: number[];
}

export interface TeamHistoryEntry {
  generation: Generation;
  gameVersion?: GameVersion;
  team: EvolutionLine[];
  attempts: number;
  date: string;
}

/** @deprecated Old format — used only for backward-compatible history reads */
export interface LegacyTeamHistoryEntry {
  generation: Generation;
  gameVersion?: GameVersion;
  team: Pokemon[];
  attempts: number;
  date: string;
}
