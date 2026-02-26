import type { Pokemon, PokemonType } from "./types";

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
  const teamTypes = new Set<PokemonType>(team.flatMap((p) => p.types));

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
