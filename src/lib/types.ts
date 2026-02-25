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

export type GamePhase =
  | "picking-generation"
  | "starter-reveal"
  | "playing"
  | "game-over";

export interface GameState {
  phase: GamePhase;
  generation: Generation | null;
  team: Pokemon[];
  attempts: number;
  currentCards: Pokemon[];
  revealedIndex: number | null;
  allPokemon: Pokemon[];
  excludedIds: number[];
}

export interface TeamHistoryEntry {
  generation: Generation;
  team: Pokemon[];
  attempts: number;
  date: string;
}
