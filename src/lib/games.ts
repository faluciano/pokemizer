import type { GameVersion } from "./types";
import { GENERATIONS } from "./starters";

export const GAME_VERSIONS: GameVersion[] = [
  // === Generation I ===
  {
    slug: "red-blue",
    displayName: "Red & Blue",
    generationId: 1,
    region: "Kanto",
    pokedexIds: [2],
    starterIds: [1, 4, 7],
    games: ["Red", "Blue"],
  },
  {
    slug: "yellow",
    displayName: "Yellow",
    generationId: 1,
    region: "Kanto",
    pokedexIds: [2],
    starterIds: [25],
    games: ["Yellow"],
  },

  // === Generation II ===
  {
    slug: "gold-silver",
    displayName: "Gold & Silver",
    generationId: 2,
    region: "Johto",
    pokedexIds: [3],
    starterIds: [152, 155, 158],
    games: ["Gold", "Silver"],
  },
  {
    slug: "crystal",
    displayName: "Crystal",
    generationId: 2,
    region: "Johto",
    pokedexIds: [3],
    starterIds: [152, 155, 158],
    games: ["Crystal"],
  },

  // === Generation III ===
  {
    slug: "ruby-sapphire",
    displayName: "Ruby & Sapphire",
    generationId: 3,
    region: "Hoenn",
    pokedexIds: [4],
    starterIds: [252, 255, 258],
    games: ["Ruby", "Sapphire"],
  },
  {
    slug: "emerald",
    displayName: "Emerald",
    generationId: 3,
    region: "Hoenn",
    pokedexIds: [4],
    starterIds: [252, 255, 258],
    games: ["Emerald"],
  },
  {
    slug: "firered-leafgreen",
    displayName: "FireRed & LeafGreen",
    generationId: 3,
    region: "Kanto",
    pokedexIds: [2],
    starterIds: [1, 4, 7],
    games: ["FireRed", "LeafGreen"],
  },

  // === Generation IV ===
  {
    slug: "diamond-pearl",
    displayName: "Diamond & Pearl",
    generationId: 4,
    region: "Sinnoh",
    pokedexIds: [5],
    starterIds: [387, 390, 393],
    games: ["Diamond", "Pearl"],
  },
  {
    slug: "platinum",
    displayName: "Platinum",
    generationId: 4,
    region: "Sinnoh",
    pokedexIds: [6],
    starterIds: [387, 390, 393],
    games: ["Platinum"],
  },
  {
    slug: "heartgold-soulsilver",
    displayName: "HeartGold & SoulSilver",
    generationId: 4,
    region: "Johto",
    pokedexIds: [7],
    starterIds: [152, 155, 158],
    games: ["HeartGold", "SoulSilver"],
  },

  // === Generation V ===
  {
    slug: "black-white",
    displayName: "Black & White",
    generationId: 5,
    region: "Unova",
    pokedexIds: [8],
    starterIds: [495, 498, 501],
    games: ["Black", "White"],
  },
  {
    slug: "black-2-white-2",
    displayName: "Black 2 & White 2",
    generationId: 5,
    region: "Unova",
    pokedexIds: [9],
    starterIds: [495, 498, 501],
    games: ["Black 2", "White 2"],
  },

  // === Generation VI ===
  {
    slug: "x-y",
    displayName: "X & Y",
    generationId: 6,
    region: "Kalos",
    pokedexIds: [12, 13, 14],
    starterIds: [650, 653, 656],
    games: ["X", "Y"],
  },
  {
    slug: "omega-ruby-alpha-sapphire",
    displayName: "Omega Ruby & Alpha Sapphire",
    generationId: 6,
    region: "Hoenn",
    pokedexIds: [15],
    starterIds: [252, 255, 258],
    games: ["Omega Ruby", "Alpha Sapphire"],
  },

  // === Generation VII ===
  {
    slug: "sun-moon",
    displayName: "Sun & Moon",
    generationId: 7,
    region: "Alola",
    pokedexIds: [16],
    starterIds: [722, 725, 728],
    games: ["Sun", "Moon"],
  },
  {
    slug: "ultra-sun-ultra-moon",
    displayName: "Ultra Sun & Ultra Moon",
    generationId: 7,
    region: "Alola",
    pokedexIds: [21],
    starterIds: [722, 725, 728],
    games: ["Ultra Sun", "Ultra Moon"],
  },
  {
    slug: "lets-go-pikachu-lets-go-eevee",
    displayName: "Let's Go, Pikachu! & Eevee!",
    generationId: 7,
    region: "Kanto",
    pokedexIds: [26],
    starterIds: [25, 133],
    games: ["Let's Go, Pikachu!", "Let's Go, Eevee!"],
  },

  // === Generation VIII ===
  {
    slug: "sword-shield",
    displayName: "Sword & Shield",
    generationId: 8,
    region: "Galar",
    pokedexIds: [27],
    starterIds: [810, 813, 816],
    games: ["Sword", "Shield"],
  },
  {
    slug: "brilliant-diamond-shining-pearl",
    displayName: "Brilliant Diamond & Shining Pearl",
    generationId: 8,
    region: "Sinnoh",
    pokedexIds: [5],
    starterIds: [387, 390, 393],
    games: ["Brilliant Diamond", "Shining Pearl"],
  },
  {
    slug: "legends-arceus",
    displayName: "Legends: Arceus",
    generationId: 8,
    region: "Hisui",
    pokedexIds: [30],
    starterIds: [722, 155, 501],
    games: ["Legends: Arceus"],
  },

  // === Generation IX ===
  {
    slug: "scarlet-violet",
    displayName: "Scarlet & Violet",
    generationId: 9,
    region: "Paldea",
    pokedexIds: [31],
    starterIds: [906, 909, 912],
    games: ["Scarlet", "Violet"],
  },
];

export function getGameVersion(slug: string): GameVersion | undefined {
  return GAME_VERSIONS.find((g) => g.slug === slug);
}

export function getGamesByGeneration(generationId: number): GameVersion[] {
  return GAME_VERSIONS.filter((g) => g.generationId === generationId);
}

export function getGenerationForGame(gameVersion: GameVersion) {
  return GENERATIONS.find((g) => g.id === gameVersion.generationId);
}
