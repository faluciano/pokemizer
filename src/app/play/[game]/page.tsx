import { notFound } from "next/navigation";
import { getGameVersion, getGenerationForGame, GAME_VERSIONS } from "@/lib/games";
import { getGameData } from "@/data";
import { GameClient } from "./game-client";

interface PageProps {
  params: Promise<{ game: string }>;
}

export function generateStaticParams() {
  return GAME_VERSIONS.map((game) => ({ game: game.slug }));
}

export const dynamicParams = false;

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

  const allPokemon = getGameData(gameParam);
  if (!allPokemon || allPokemon.length === 0) {
    notFound();
  }

  return (
    <GameClient
      generation={generation}
      gameVersion={gameVersion}
      allPokemon={allPokemon}
    />
  );
}
