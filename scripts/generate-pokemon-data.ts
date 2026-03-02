/**
 * generate-pokemon-data.ts
 *
 * Build script that fetches all Pokemon data from PokeAPI and writes
 * per-game JSON files to src/data/ as EvolutionLine[]. Run manually via:
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
  evolution_chain: { url: string };
}

interface PokeApiPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface PokeApiEncounterEntry {
  location_area: { name: string; url: string };
  version_details: {
    encounter_details: { chance: number; min_level: number; max_level: number; method: { name: string } }[];
    max_chance: number;
    version: { name: string; url: string };
  }[];
}

interface EvolutionChainNode {
  species: { name: string; url: string };
  evolves_to: EvolutionChainNode[];
}

interface PokeApiEvolutionChain {
  id: number;
  chain: EvolutionChainNode;
}

// ---------------------------------------------------------------------------
// Output types (matches src/lib/types.ts EvolutionLine & EvolutionStage)
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

interface EvolutionStageOutput {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: BaseStats;
  stage: number;
  locations: string[];
}

interface EvolutionLineOutput {
  lineId: number;
  stages: EvolutionStageOutput[];
  types: string[];
  isStarter: boolean;
  branchIndex?: number;
}

interface SpeciesData {
  id: number;
  isLegendary: boolean;
  isMythical: boolean;
  evolvesFromSpecies: boolean;
  evolutionChainUrl: string;
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

/**
 * Convert a game display name (e.g. "FireRed", "Let's Go, Pikachu!") to a
 * PokeAPI version slug (e.g. "firered", "lets-go-pikachu").
 */
function gameDisplayNameToPokeApiVersion(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // Remove punctuation (commas, exclamation marks, colons, periods)
    .trim()
    .replace(/\s+/g, "-");          // Spaces to hyphens
}

/**
 * Transform a PokeAPI location area slug to a human-readable name.
 * e.g. "kanto-viridian-forest-area" → "Viridian Forest"
 * e.g. "mt-moon-1f" → "Mt. Moon 1F"
 * e.g. "kanto-route-2-south-towards-viridian-city" → "Route 2"
 */
function formatLocationName(slug: string): string {
  // Remove region prefix: "kanto-route-2-area" → "route-2-area"
  const regionPrefixes = [
    "kanto-", "johto-", "hoenn-", "sinnoh-", "unova-",
    "kalos-", "alola-", "galar-", "paldea-", "hisui-", "pasio-",
  ];
  let name = slug;
  for (const prefix of regionPrefixes) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }

  // Strip generic suffixes that add noise
  name = name.replace(/-area$/, "");

  // Strip sub-area descriptors after the main name for routes
  // "route-2-south-towards-viridian-city" → "route-2"
  name = name.replace(/(route-\d+)-.+$/, "$1");

  // Convert kebab-case to Title Case
  let result = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Fix common abbreviations
  result = result.replace(/\bMt\b/g, "Mt.");
  result = result.replace(/\bSs\b/g, "S.S.");
  result = result.replace(/\bPokemon\b/g, "Pokémon");

  // Uppercase floor suffixes: "1f" → "1F", "b1f" → "B1F"
  result = result.replace(/\b([Bb]?\d+[Ff])\b/g, (m) => m.toUpperCase());

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
// Chain walking — builds EvolutionLine[] from a chain tree
// ---------------------------------------------------------------------------

function walkChain(
  node: EvolutionChainNode,
  pokemonMap: Map<number, PokemonData>,
  gameSpeciesIds: Set<number>,
  speciesDataMap: Map<number, SpeciesData>,
  currentPath: EvolutionStageOutput[],
  stage: number,
  results: EvolutionLineOutput[],
  starterIds: number[],
  branchCounter: { count: number },
  hasBranching: boolean,
): void {
  const speciesId = extractIdFromUrl(node.species.url);

  // Skip mega/gmax forms (id > 10000), species not in this game, or missing pokemon data
  if (speciesId > 10000 || !gameSpeciesIds.has(speciesId) || !pokemonMap.has(speciesId)) {
    if (currentPath.length === 0) {
      // Base form missing from this game's pokedex — skip it but continue walking
      // children. This handles cases like Pichu→Pikachu→Raichu in Yellow where
      // Pichu (Gen II) doesn't exist but Pikachu (starter) does.
      for (const child of node.evolves_to) {
        walkChain(
          child,
          pokemonMap,
          gameSpeciesIds,
          speciesDataMap,
          [],
          0,
          results,
          starterIds,
          branchCounter,
          hasBranching,
        );
      }
      return;
    }
    // Mid/final stage missing — truncate here, emit what we have
    emitLine(currentPath, results, starterIds, speciesDataMap, branchCounter, hasBranching);
    return;
  }

  const pokemon = pokemonMap.get(speciesId)!;
  const stageEntry: EvolutionStageOutput = {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    sprite: `${SPRITES_BASE}/${pokemon.id}.png`,
    stats: pokemon.stats,
    stage,
    locations: [],
  };

  const newPath = [...currentPath, stageEntry];

  if (node.evolves_to.length === 0) {
    // End of chain — emit the line
    emitLine(newPath, results, starterIds, speciesDataMap, branchCounter, hasBranching);
    return;
  }

  // Determine if this node introduces branching
  const branchingHere = node.evolves_to.length > 1;
  const newHasBranching = hasBranching || branchingHere;

  for (const child of node.evolves_to) {
    walkChain(
      child,
      pokemonMap,
      gameSpeciesIds,
      speciesDataMap,
      newPath,
      stage + 1,
      results,
      starterIds,
      branchCounter,
      newHasBranching,
    );
  }
}

function emitLine(
  path: EvolutionStageOutput[],
  results: EvolutionLineOutput[],
  starterIds: number[],
  speciesDataMap: Map<number, SpeciesData>,
  branchCounter: { count: number },
  hasBranching: boolean,
): void {
  if (path.length === 0) return;

  // Check legendary/mythical: if ANY stage is legendary/mythical, skip unless starter line
  const stageIds = path.map((s) => s.id);
  const hasLegendaryOrMythical = stageIds.some((id) => {
    const species = speciesDataMap.get(id);
    return species && (species.isLegendary || species.isMythical);
  });
  const containsStarter = stageIds.some((id) => starterIds.includes(id));

  if (hasLegendaryOrMythical && !containsStarter) {
    return;
  }

  const line: EvolutionLineOutput = {
    lineId: path[0].id,
    stages: path,
    types: path[0].types,
    isStarter: containsStarter,
  };

  if (hasBranching) {
    line.branchIndex = branchCounter.count;
    branchCounter.count++;
  }

  results.push(line);
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
  const speciesDataMap = new Map<number, SpeciesData>();

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
          evolutionChainUrl: data.evolution_chain.url,
        });
        speciesFetched++;
        if (speciesFetched % 100 === 0 || speciesFetched === allSpeciesIds.size) {
          console.log(`Fetching species (${speciesFetched}/${allSpeciesIds.size})...`);
        }
      })
    )
  );

  // --- Step 6: Collect and fetch evolution chains ---
  const uniqueChainUrls = new Set<string>();
  for (const species of speciesDataMap.values()) {
    uniqueChainUrls.add(species.evolutionChainUrl);
  }
  console.log(`Fetching evolution chains (0/${uniqueChainUrls.size})...`);
  let chainsFetched = 0;
  const chainMap = new Map<number, PokeApiEvolutionChain>();

  await Promise.all(
    [...uniqueChainUrls].map((chainUrl) =>
      limit(async () => {
        const chainId = extractIdFromUrl(chainUrl);
        const data = await fetchWithRetry<PokeApiEvolutionChain>(
          chainUrl,
          `evolution-chain/${chainId}`
        );
        chainMap.set(chainId, data);
        chainsFetched++;
        if (chainsFetched % 100 === 0 || chainsFetched === uniqueChainUrls.size) {
          console.log(`Fetching evolution chains (${chainsFetched}/${uniqueChainUrls.size})...`);
        }
      })
    )
  );

  // --- Step 7: Build species-to-chain mapping ---
  const speciesChainMap = new Map<number, number>();
  for (const [speciesId, species] of speciesDataMap) {
    const chainId = extractIdFromUrl(species.evolutionChainUrl);
    speciesChainMap.set(speciesId, chainId);
  }
  console.log(`Species-to-chain mapping: ${speciesChainMap.size} entries`);

  // --- Step 8: Fetch pokemon details for ALL species in the pokedexes ---
  // Filter out IDs > 10000 (mega forms, Gmax forms, etc.)
  const fetchableSpeciesIds = new Set<number>();
  for (const id of allSpeciesIds) {
    if (id <= 10000) {
      fetchableSpeciesIds.add(id);
    }
  }
  console.log(`Fetching pokemon details (0/${fetchableSpeciesIds.size})...`);
  let pokemonFetched = 0;
  const pokemonMap = new Map<number, PokemonData>();

  await Promise.all(
    [...fetchableSpeciesIds].map((speciesId) =>
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
        if (pokemonFetched % 100 === 0 || pokemonFetched === fetchableSpeciesIds.size) {
          console.log(`Fetching pokemon details (${pokemonFetched}/${fetchableSpeciesIds.size})...`);
        }
      })
    )
  );

  // --- Step 8.5: Fetch encounter data for each unique species ---
  console.log(`Fetching encounter data (0/${fetchableSpeciesIds.size})...`);
  let encountersFetched = 0;
  const encounterMap = new Map<number, PokeApiEncounterEntry[]>();

  await Promise.all(
    [...fetchableSpeciesIds].map((speciesId) =>
      limit(async () => {
        const data = await fetchWithRetry<PokeApiEncounterEntry[]>(
          `${POKEAPI_BASE}/pokemon/${speciesId}/encounters`,
          `pokemon/${speciesId}/encounters`
        );
        encounterMap.set(speciesId, data);
        encountersFetched++;
        if (encountersFetched % 100 === 0 || encountersFetched === fetchableSpeciesIds.size) {
          console.log(`Fetching encounter data (${encountersFetched}/${fetchableSpeciesIds.size})...`);
        }
      })
    )
  );

  // --- Step 9: Build per-game evolution lines and write JSON files ---
  console.log("\nGenerating per-game data files...");
  await mkdir(DATA_DIR, { recursive: true });

  const totalUniqueLines = new Set<string>();

  for (const game of GAME_VERSIONS) {
    // Collect all species IDs in this game's pokedexes
    const gameSpeciesIds = new Set<number>();
    for (const pokedexId of game.pokedexIds) {
      const speciesInPokedex = pokedexMap.get(pokedexId);
      if (speciesInPokedex) {
        for (const id of speciesInPokedex) {
          gameSpeciesIds.add(id);
        }
      }
    }

    // Remove version-excluded species
    if (game.excludedSpeciesIds) {
      for (const excludedId of game.excludedSpeciesIds) {
        gameSpeciesIds.delete(excludedId);
      }
    }

    // Group species by their evolution chain ID
    const chainSpeciesGroups = new Map<number, Set<number>>();
    for (const speciesId of gameSpeciesIds) {
      const chainId = speciesChainMap.get(speciesId);
      if (chainId === undefined) continue;
      if (!chainSpeciesGroups.has(chainId)) {
        chainSpeciesGroups.set(chainId, new Set());
      }
      chainSpeciesGroups.get(chainId)!.add(speciesId);
    }

    // Build evolution lines for each chain
    const gameLines: EvolutionLineOutput[] = [];

    for (const [chainId] of chainSpeciesGroups) {
      const chain = chainMap.get(chainId);
      if (!chain) continue;

      const branchCounter = { count: 0 };
      const chainResults: EvolutionLineOutput[] = [];

      walkChain(
        chain.chain,
        pokemonMap,
        gameSpeciesIds,
        speciesDataMap,
        [],
        0,
        chainResults,
        game.starterIds,
        branchCounter,
        false,
      );

      gameLines.push(...chainResults);
    }

    // Sort by lineId ascending, then branchIndex ascending
    gameLines.sort((a, b) => {
      if (a.lineId !== b.lineId) return a.lineId - b.lineId;
      return (a.branchIndex ?? -1) - (b.branchIndex ?? -1);
    });

    // Populate locations for this game version
    const pokeApiVersionNames = game.games.map(gameDisplayNameToPokeApiVersion);
    for (const line of gameLines) {
      for (const stage of line.stages) {
        const encounters = encounterMap.get(stage.id) ?? [];
        const locationNames = new Set<string>();
        for (const enc of encounters) {
          for (const vd of enc.version_details) {
            if (pokeApiVersionNames.includes(vd.version.name)) {
              locationNames.add(formatLocationName(enc.location_area.name));
            }
          }
        }
        // Collapse floor/sub-area variants: "Mt. Moon 1F", "Mt. Moon B1F" → "Mt. Moon"
        const collapsed = new Set<string>();
        for (const loc of locationNames) {
          const base = loc.replace(/\s+\d*B?\d+F$/i, "").trim();
          collapsed.add(base);
        }
        stage.locations = [...collapsed].sort();
      }
    }

    // Track unique lines for summary
    for (const line of gameLines) {
      totalUniqueLines.add(`${line.lineId}-${line.branchIndex ?? "x"}`);
    }

    // --- Step 10: Validation ---
    validate(game, gameLines);

    // Write JSON file
    const filePath = join(DATA_DIR, `${game.slug}.json`);
    await writeFile(filePath, JSON.stringify(gameLines, null, 2) + "\n");
    console.log(`  ${game.slug}: ${gameLines.length} evolution lines \u2713`);
  }

  // --- Step 11: Generate barrel file ---
  console.log("\nGenerating barrel file (src/data/index.ts)...");
  const barrelContent = generateBarrelFile(GAME_VERSIONS);
  await writeFile(join(DATA_DIR, "index.ts"), barrelContent);
  console.log("  src/data/index.ts \u2713");

  // --- Summary ---
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(
    `\nGenerated data for ${GAME_VERSIONS.length} games. Total unique evolution lines: ${totalUniqueLines.size}. Files written to src/data/`
  );
  console.log(`Completed in ${elapsed}s.`);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(game: GameVersion, lines: EvolutionLineOutput[]): void {
  const errors: string[] = [];

  // At least 15 evolution lines per game
  if (lines.length < 15) {
    errors.push(
      `${game.slug}: expected at least 15 evolution lines, got ${lines.length}`
    );
  }

  // All starters must be present — at least one line with isStarter=true for each starter ID
  const allStageIds = new Set<number>();
  for (const line of lines) {
    for (const stage of line.stages) {
      allStageIds.add(stage.id);
    }
  }
  for (const starterId of game.starterIds) {
    const hasStarterLine = lines.some(
      (line) => line.isStarter && line.stages.some((s) => s.id === starterId)
    );
    if (!hasStarterLine) {
      errors.push(
        `${game.slug}: starter ${starterId} is missing from evolution lines`
      );
    }
  }

  // Each line must have at least 1 stage
  for (const line of lines) {
    if (line.stages.length < 1) {
      errors.push(`${game.slug}: evolution line ${line.lineId} has no stages`);
    }

    // Each stage must have valid id, name, types
    for (const stage of line.stages) {
      if (stage.id <= 0) {
        errors.push(`${game.slug}: stage has invalid id ${stage.id}`);
      }
      if (!stage.name || stage.name.length === 0) {
        errors.push(`${game.slug}: stage ${stage.id} has empty name`);
      }
      if (!stage.types || stage.types.length < 1) {
        errors.push(`${game.slug}: stage ${stage.id} (${stage.name}) has no types`);
      }
    }

    // lineId must match first stage's id
    if (line.stages.length > 0 && line.lineId !== line.stages[0].id) {
      errors.push(
        `${game.slug}: lineId ${line.lineId} does not match first stage id ${line.stages[0].id}`
      );
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
    recordEntries.push(`  "${game.slug}": ${varName} as unknown as EvolutionLine[],`);
  }

  return [
    `import type { EvolutionLine } from "@/lib/types";`,
    ...importLines,
    ``,
    `const GAME_DATA: Record<string, EvolutionLine[]> = {`,
    ...recordEntries,
    `};`,
    ``,
    `export function getGameData(slug: string): EvolutionLine[] | undefined {`,
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
