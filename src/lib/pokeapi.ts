import type { Pokemon, PokemonType, BaseStats, GameVersion } from "./types";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

// PokeAPI response types (partial)
interface PokeApiSpeciesResponse {
  id: number;
  is_legendary: boolean;
  is_mythical: boolean;
  evolves_from_species: { name: string; url: string } | null;
}

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface PokeApiPokedexResponse {
  pokemon_entries: {
    entry_number: number;
    pokemon_species: { name: string; url: string };
  }[];
}

function extractStats(stats: { base_stat: number; stat: { name: string } }[]): BaseStats {
  const get = (name: string) => stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
  return {
    hp: get("hp"),
    attack: get("attack"),
    defense: get("defense"),
    spAtk: get("special-attack"),
    spDef: get("special-defense"),
    speed: get("speed"),
  };
}

async function fetchPokemonDetailsRaw(id: number): Promise<Omit<Pokemon, "isStarter">> {
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
    stats: extractStats(data.stats),
  };
}

async function fetchSpeciesData(id: number): Promise<PokeApiSpeciesResponse> {
  const res = await fetch(`${POKEAPI_BASE}/pokemon-species/${id}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch species ${id}`);
  return res.json();
}

/**
 * Fetch all Pokemon available in a specific game version using its pokedex.
 * Filters out legendaries, mythicals, and evolved forms (base forms only).
 */
export async function getGamePokemon(gameVersion: GameVersion): Promise<Pokemon[]> {
  // Fetch all pokedex entries for this game (some games have multiple pokedexes)
  const allEntries = new Map<number, string>();

  await Promise.all(
    gameVersion.pokedexIds.map(async (pokedexId) => {
      const res = await fetch(`${POKEAPI_BASE}/pokedex/${pokedexId}`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error(`Failed to fetch pokedex ${pokedexId}`);
      const data: PokeApiPokedexResponse = await res.json();

      for (const entry of data.pokemon_entries) {
        const id = extractIdFromUrl(entry.pokemon_species.url);
        allEntries.set(id, entry.pokemon_species.name);
      }
    })
  );

  const speciesIds = [...allEntries.keys()];

  // Fetch species data to filter legendaries, mythicals, and evolved forms
  const speciesData = await Promise.all(
    speciesIds.map((id) => fetchSpeciesData(id))
  );

  const validSpeciesIds = speciesData
    .filter((s) => !s.is_legendary && !s.is_mythical && s.evolves_from_species === null)
    .map((s) => s.id);

  // Mark starters based on the game's starter IDs
  const starterSet = new Set(gameVersion.starterIds);

  const pokemon = await Promise.all(
    validSpeciesIds.map(async (id) => {
      const p = await fetchPokemonDetailsRaw(id);
      return {
        ...p,
        isStarter: starterSet.has(id),
      };
    })
  );

  return pokemon.sort((a, b) => a.id - b.id);
}

export function getRandomStarter(allPokemon: Pokemon[]): Pokemon {
  const starters = allPokemon.filter((p) => p.isStarter);
  return starters[Math.floor(Math.random() * starters.length)];
}

export function getRandomCards(
  allPokemon: Pokemon[],
  team: Pokemon[],
  count: number = 3,
  excludeIds: Set<number> = new Set()
): Pokemon[] {
  const teamIds = new Set(team.map((p) => p.id));
  const available = allPokemon.filter(
    (p) => !teamIds.has(p.id) && !excludeIds.has(p.id)
  );

  if (available.length === 0) return [];

  // Compute team's current type coverage
  const teamTypes = new Set(team.flatMap((p) => p.types));

  // Weight each pokemon: 3x boost for each type NOT already on team
  const weighted = available.map((pokemon) => {
    const uncoveredCount = pokemon.types.filter((t) => !teamTypes.has(t)).length;
    const weight = 1 + uncoveredCount * 2;
    return { pokemon, weight };
  });

  // Weighted random sampling without replacement
  const selected: Pokemon[] = [];
  const pool = [...weighted];

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let chosenIndex = 0;
    for (let j = 0; j < pool.length; j++) {
      random -= pool[j].weight;
      if (random <= 0) {
        chosenIndex = j;
        break;
      }
    }

    selected.push(pool[chosenIndex].pokemon);
    pool.splice(chosenIndex, 1);
  }

  return selected;
}
