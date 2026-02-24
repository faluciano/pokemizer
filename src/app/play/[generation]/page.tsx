import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/starters";
import { getGenerationPokemon } from "@/lib/pokeapi";
import { GameClient } from "./game-client";

interface PageProps {
  params: Promise<{ generation: string }>;
}

export default async function PlayPage({ params }: PageProps) {
  const { generation: generationParam } = await params;
  const generationId = parseInt(generationParam, 10);

  if (isNaN(generationId) || generationId < 1 || generationId > 9) {
    notFound();
  }

  const generation = getGeneration(generationId);
  if (!generation) {
    notFound();
  }

  const allPokemon = await getGenerationPokemon(generationId);

  return <GameClient generation={generation} allPokemon={allPokemon} />;
}
