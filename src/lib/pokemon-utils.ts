import type { EvolutionLine, PokemonType } from "./types";

export function getRandomStarter(allPokemon: EvolutionLine[]): EvolutionLine {
  const starters = allPokemon.filter((l) => l.isStarter);
  return starters[Math.floor(Math.random() * starters.length)];
}

export function getRandomCards(
  allPokemon: EvolutionLine[],
  team: EvolutionLine[],
  count: number = 3,
  excludeLineIds: Set<number> = new Set()
): EvolutionLine[] {
  const teamLineIds = new Set(team.map((l) => l.lineId));
  const available = allPokemon.filter(
    (l) => !teamLineIds.has(l.lineId) && !excludeLineIds.has(l.lineId)
  );

  if (available.length === 0) return [];

  // Compute team's current type coverage (using base form types)
  const teamTypes = new Set<PokemonType>(team.flatMap((l) => l.types));

  // Weight each line: boost for types NOT already on team
  const weighted = available.map((line) => {
    const uncoveredCount = line.types.filter((t) => !teamTypes.has(t)).length;
    const weight = 1 + uncoveredCount * 2;
    return { line, weight };
  });

  // Weighted random sampling without replacement
  const selected: EvolutionLine[] = [];
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

    selected.push(pool[chosenIndex].line);
    pool.splice(chosenIndex, 1);
  }

  return selected;
}
