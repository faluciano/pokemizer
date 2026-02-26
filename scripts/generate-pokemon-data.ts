/**
 * generate-pokemon-data.ts
 *
 * Build script that fetches all Pokemon data from PokeAPI and writes
 * per-game JSON files to src/data/. Run manually via:
 *
 *   bun scripts/generate-pokemon-data.ts
 *
 * Zero external dependencies — uses only Bun built-ins and native fetch.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { GAME_VERSIONS } from "../src/lib/games";
import type { GameVersion } from "../src/lib/types";

// ---------------------------------------------------------------------------
// Types for PokeAPI responses (only the fields we use)
// ---------------------------------------------------------------------------

interface PokeApiPokedex {
  pokemon_entries: {
    pokemon_species: { url: string };
  }[];
}

interface PokeApiSpecies {
  id: number;
  is_legendary: boolean;
  is_mythical: boolean;
  evolves_from_species: { url: string } | null;
}

interface PokeApiPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

// ---------------------------------------------------------------------------
// Output types (matches src/lib/types.ts Pokemon & BaseStats)
// ---------------------------------------------------------------------------

interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

interface PokemonData {
  id: number;
  name: string;
  types: string[];
  stats: BaseStats;
}

interface PokemonOutput {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  isStarter: boolean;
  stats: BaseStats;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const MAX_CONCURRENCY = 30;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DATA_DIR = join(import.meta.dir, "..", "src", "data");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

/** Map PokeAPI stat names to our BaseStats keys. */
const STAT_NAME_MAP: Record<string, keyof BaseStats> = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "spAtk",
  "special-defense": "spDef",
  speed: "speed",
};

function parseStats(
  stats: { base_stat: number; stat: { name: string } }[]
): BaseStats {
  const result: BaseStats = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
  for (const s of stats) {
    const key = STAT_NAME_MAP[s.stat.name];
    if (key) {
      result[key] = s.base_stat;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

function createLimiter(concurrency: number) {
  let running = 0;
  const queue: (() => void)[] = [];

  function release() {
    const next = queue.shift();
    if (next) {
      // Hand the slot directly to the next queued task (running stays the same)
      next();
    } else {
      running--;
    }
  }

  return async function limit<T>(fn: () => Promise<T>): Promise<T> {
    if (running < concurrency) {
      running++;
    } else {
      // Wait until a slot is handed to us by release()
      await new Promise<void>((resolve) => {
        queue.push(resolve);
      });
    }
    try {
      return await fn();
    } finally {
      release();
    }
  };
}

// ---------------------------------------------------------------------------
// Fetch with retry + exponential backoff
// ---------------------------------------------------------------------------

async function fetchWithRetry<T>(url: string, label: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      if (attempt < MAX_RETRIES) {
        console.warn(
          `  ⚠ Retry ${attempt}/${MAX_RETRIES} for ${label}: ${error instanceof Error ? error.message : error}. Waiting ${delay}ms...`
        );
        await Bun.sleep(delay);
      } else {
        console.error(
          `  ✗ Failed after ${MAX_RETRIES} attempts: ${label} — ${error instanceof Error ? error.message : error}`
        );
        throw error;
      }
    }
  }
  // Unreachable, but TypeScript needs it
  throw new Error(`Unreachable: ${label}`);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function main() {
  const startTime = performance.now();

  // --- Step 1: Collect all unique pokedex IDs ---
  const allPokedexIds = new Set<number>();
  for (const game of GAME_VERSIONS) {
    for (const id of game.pokedexIds) {
      allPokedexIds.add(id);
    }
  }
  console.log(`Found ${GAME_VERSIONS.length} game versions with ${allPokedexIds.size} unique pokedex IDs.`);

  // --- Step 2: Fetch each pokedex → build pokedexId → Set<speciesId> ---
  console.log("Fetching pokedexes...");
  const limit = createLimiter(MAX_CONCURRENCY);
  const pokedexMap = new Map<number, Set<number>>();

  await Promise.all(
    [...allPokedexIds].map((pokedexId) =>
      limit(async () => {
        const data = await fetchWithRetry<PokeApiPokedex>(
          `${POKEAPI_BASE}/pokedex/${pokedexId}`,
          `pokedex/${pokedexId}`
        );
        const speciesIds = new Set<number>();
        for (const entry of data.pokemon_entries) {
          speciesIds.add(extractIdFromUrl(entry.pokemon_species.url));
        }
        pokedexMap.set(pokedexId, speciesIds);
        console.log(`  pokedex/${pokedexId}: ${speciesIds.size} species`);
      })
    )
  );

  // --- Step 3: Collect all unique species IDs across all pokedexes ---
  const allSpeciesIds = new Set<number>();
  for (const speciesSet of pokedexMap.values()) {
    for (const id of speciesSet) {
      allSpeciesIds.add(id);
    }
  }
  console.log(`Total unique species across all pokedexes: ${allSpeciesIds.size}`);

  // --- Step 4: Collect all unique starter IDs (global) ---
  const allStarterIds = new Set<number>();
  for (const game of GAME_VERSIONS) {
    for (const id of game.starterIds) {
      allStarterIds.add(id);
    }
  }
  console.log(`Total unique starters: ${allStarterIds.size}`);

  // --- Step 5: Fetch species data for each unique species ---
  console.log(`Fetching species (0/${allSpeciesIds.size})...`);
  let speciesFetched = 0;
  const speciesDataMap = new Map<
    number,
    { id: number; isLegendary: boolean; isMythical: boolean; evolvesFromSpecies: boolean }
  >();

  const speciesArray = [...allSpeciesIds];
  await Promise.all(
    speciesArray.map((speciesId) =>
      limit(async () => {
        const data = await fetchWithRetry<PokeApiSpecies>(
          `${POKEAPI_BASE}/pokemon-species/${speciesId}`,
          `pokemon-species/${speciesId}`
        );
        speciesDataMap.set(speciesId, {
          id: data.id,
          isLegendary: data.is_legendary,
          isMythical: data.is_mythical,
          evolvesFromSpecies: data.evolves_from_species !== null,
        });
        speciesFetched++;
        if (speciesFetched % 100 === 0 || speciesFetched === allSpeciesIds.size) {
          console.log(`Fetching species (${speciesFetched}/${allSpeciesIds.size})...`);
        }
      })
    )
  );

  // --- Step 6: Determine valid species ---
  const validSpeciesIds = new Set<number>();
  for (const [speciesId, species] of speciesDataMap) {
    const isBaseForm =
      !species.evolvesFromSpecies && !species.isLegendary && !species.isMythical;
    const isStarter = allStarterIds.has(speciesId);
    if (isBaseForm || isStarter) {
      validSpeciesIds.add(speciesId);
    }
  }
  console.log(`Valid species (base-form + starters): ${validSpeciesIds.size}`);

  // --- Step 7: Fetch pokemon details for each valid species ---
  console.log(`Fetching pokemon details (0/${validSpeciesIds.size})...`);
  let pokemonFetched = 0;
  const pokemonMap = new Map<number, PokemonData>();

  const validArray = [...validSpeciesIds];
  await Promise.all(
    validArray.map((speciesId) =>
      limit(async () => {
        const data = await fetchWithRetry<PokeApiPokemon>(
          `${POKEAPI_BASE}/pokemon/${speciesId}`,
          `pokemon/${speciesId}`
        );
        pokemonMap.set(speciesId, {
          id: data.id,
          name: data.name,
          types: data.types.map((t) => t.type.name),
          stats: parseStats(data.stats),
        });
        pokemonFetched++;
        if (pokemonFetched % 100 === 0 || pokemonFetched === validSpeciesIds.size) {
          console.log(`Fetching pokemon details (${pokemonFetched}/${validSpeciesIds.size})...`);
        }
      })
    )
  );

  // --- Step 8: Build per-game data and write JSON files ---
  console.log("\nGenerating per-game data files...");
  await mkdir(DATA_DIR, { recursive: true });

  const totalUniquePokemon = new Set<number>();

  for (const game of GAME_VERSIONS) {
    const gameSpeciesIds = new Set<number>();
    for (const pokedexId of game.pokedexIds) {
      const speciesInPokedex = pokedexMap.get(pokedexId);
      if (speciesInPokedex) {
        for (const id of speciesInPokedex) {
          gameSpeciesIds.add(id);
        }
      }
    }

    // Intersect with valid species
    const gamePokemon: PokemonOutput[] = [];
    for (const speciesId of gameSpeciesIds) {
      if (!validSpeciesIds.has(speciesId)) continue;
      const pokemon = pokemonMap.get(speciesId);
      if (!pokemon) continue;

      gamePokemon.push({
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types,
        sprite: `${SPRITES_BASE}/${pokemon.id}.png`,
        isStarter: game.starterIds.includes(pokemon.id),
        stats: pokemon.stats,
      });

      totalUniquePokemon.add(pokemon.id);
    }

    // Sort by id ascending
    gamePokemon.sort((a, b) => a.id - b.id);

    // --- Step 9: Validation ---
    validate(game, gamePokemon);

    // Write JSON file
    const filePath = join(DATA_DIR, `${game.slug}.json`);
    await writeFile(filePath, JSON.stringify(gamePokemon, null, 2) + "\n");
    console.log(`  ${game.slug}: ${gamePokemon.length} pokemon \u2713`);
  }

  // --- Step 10: Generate barrel file ---
  console.log("\nGenerating barrel file (src/data/index.ts)...");
  const barrelContent = generateBarrelFile(GAME_VERSIONS);
  await writeFile(join(DATA_DIR, "index.ts"), barrelContent);
  console.log("  src/data/index.ts \u2713");

  // --- Summary ---
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(
    `\nGenerated data for ${GAME_VERSIONS.length} games. Total unique pokemon: ${totalUniquePokemon.size}. Files written to src/data/`
  );
  console.log(`Completed in ${elapsed}s.`);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(game: GameVersion, pokemon: PokemonOutput[]): void {
  const errors: string[] = [];

  // At least 15 base-form pokemon per game
  if (pokemon.length < 15) {
    errors.push(
      `${game.slug}: expected at least 15 pokemon, got ${pokemon.length}`
    );
  }

  // All starters must be present
  const pokemonIds = new Set(pokemon.map((p) => p.id));
  for (const starterId of game.starterIds) {
    if (!pokemonIds.has(starterId)) {
      errors.push(
        `${game.slug}: starter ${starterId} is missing from output`
      );
    }
  }

  // Each pokemon must have valid id, name, types
  for (const p of pokemon) {
    if (p.id <= 0) {
      errors.push(`${game.slug}: pokemon has invalid id ${p.id}`);
    }
    if (!p.name || p.name.length === 0) {
      errors.push(`${game.slug}: pokemon ${p.id} has empty name`);
    }
    if (!p.types || p.types.length < 1) {
      errors.push(`${game.slug}: pokemon ${p.id} (${p.name}) has no types`);
    }
  }

  if (errors.length > 0) {
    console.error("\n\u2717 Validation failed:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Barrel file generation
// ---------------------------------------------------------------------------

function generateBarrelFile(gameVersions: GameVersion[]): string {
  const importLines: string[] = [];
  const recordEntries: string[] = [];

  for (const game of gameVersions) {
    // Convert slug to a valid JS identifier: "red-blue" → "redBlue"
    const varName = slugToIdentifier(game.slug);
    importLines.push(`import ${varName} from "./${game.slug}.json";`);
    recordEntries.push(`  "${game.slug}": ${varName} as unknown as Pokemon[],`);
  }

  return [
    `import type { Pokemon } from "@/lib/types";`,
    ...importLines,
    ``,
    `const GAME_DATA: Record<string, Pokemon[]> = {`,
    ...recordEntries,
    `};`,
    ``,
    `export function getGameData(slug: string): Pokemon[] | undefined {`,
    `  return GAME_DATA[slug];`,
    `}`,
    ``,
  ].join("\n");
}

/** Convert a kebab-case slug to a camelCase JS identifier. */
function slugToIdentifier(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
