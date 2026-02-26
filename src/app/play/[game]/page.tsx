import { notFound } from "next/navigation";
import { getGameVersion, getGenerationForGame } from "@/lib/games";
import { getGamePokemon } from "@/lib/pokeapi";
import { GameClient } from "./game-client";

interface PageProps {
  params: Promise<{ game: string }>;
}

export default async function PlayPage({ params }: PageProps) {
  const { game: gameParam } = await params;

  const gameVersion = getGameVersion(gameParam);
  if (!gameVersion) {
    notFound();
  }

  const generation = getGenerationForGame(gameVersion);
  if (!generation) {
    notFound();
  }

  const allPokemon = await getGamePokemon(gameVersion);

  return (
    <GameClient
      generation={generation}
      gameVersion={gameVersion}
      allPokemon={allPokemon}
    />
  );
}
