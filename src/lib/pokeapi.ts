import type { Pokemon, PokemonType } from "./types";
import { GENERATIONS, isStarter as checkIsStarter } from "./starters";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

// PokeAPI response types (partial)
interface PokeApiGenerationResponse {
  pokemon_species: { name: string; url: string }[];
}

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
}

export async function fetchPokemonDetails(id: number, generationId: number): Promise<Pokemon> {
  const res = await fetch(`${POKEAPI_BASE}/pokemon/${id}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`);
  const data: PokeApiPokemonResponse = await res.json();
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name as PokemonType),
    sprite: getSpriteUrl(data.id),
    isStarter: checkIsStarter(generationId, data.id),
  };
}

export async function getGenerationPokemon(generationId: number): Promise<Pokemon[]> {
  const gen = GENERATIONS.find((g) => g.id === generationId);
  if (!gen) throw new Error(`Generation ${generationId} not found`);

  const res = await fetch(`${POKEAPI_BASE}/generation/${gen.name}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch generation ${gen.name}`);
  const data: PokeApiGenerationResponse = await res.json();

  const speciesIds = data.pokemon_species.map((s) => extractIdFromUrl(s.url));

  // Fetch all pokemon details in parallel
  const pokemon = await Promise.all(
    speciesIds.map((id) => fetchPokemonDetails(id, generationId))
  );

  // Sort by national dex number
  return pokemon.sort((a, b) => a.id - b.id);
}

export function getRandomStarter(allPokemon: Pokemon[]): Pokemon {
  const starters = allPokemon.filter((p) => p.isStarter);
  return starters[Math.floor(Math.random() * starters.length)];
}

export function getRandomCards(
  allPokemon: Pokemon[],
  team: Pokemon[],
  count: number = 5
): Pokemon[] {
  const teamIds = new Set(team.map((p) => p.id));
  const available = allPokemon.filter((p) => !teamIds.has(p.id) && !p.isStarter);

  // Fisher-Yates shuffle and take first `count`
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
