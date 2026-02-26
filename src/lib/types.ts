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
  team: Pokemon[];
  attempts: number;
  currentCards: Pokemon[];
  revealedIndex: number | null;
  allPokemon: Pokemon[];
  excludedIds: number[];
}

export interface TeamHistoryEntry {
  generation: Generation;
  gameVersion?: GameVersion;
  team: Pokemon[];
  attempts: number;
  date: string;
}
