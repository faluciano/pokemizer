import type { Generation } from "./types";

export const GENERATIONS: Generation[] = [
  { id: 1, name: "generation-i", displayName: "Generation I", region: "Kanto", starterIds: [1, 4, 7] },
  { id: 2, name: "generation-ii", displayName: "Generation II", region: "Johto", starterIds: [152, 155, 158] },
  { id: 3, name: "generation-iii", displayName: "Generation III", region: "Hoenn", starterIds: [252, 255, 258] },
  { id: 4, name: "generation-iv", displayName: "Generation IV", region: "Sinnoh", starterIds: [387, 390, 393] },
  { id: 5, name: "generation-v", displayName: "Generation V", region: "Unova", starterIds: [495, 498, 501] },
  { id: 6, name: "generation-vi", displayName: "Generation VI", region: "Kalos", starterIds: [650, 653, 656] },
  { id: 7, name: "generation-vii", displayName: "Generation VII", region: "Alola", starterIds: [722, 725, 728] },
  { id: 8, name: "generation-viii", displayName: "Generation VIII", region: "Galar", starterIds: [810, 813, 816] },
  { id: 9, name: "generation-ix", displayName: "Generation IX", region: "Paldea", starterIds: [906, 909, 912] },
];

export function getGeneration(id: number): Generation | undefined {
  return GENERATIONS.find((g) => g.id === id);
}

export function getGenerationByName(name: string): Generation | undefined {
  return GENERATIONS.find((g) => g.name === name);
}
