import type { Metadata } from "next";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game: gameParam } = await params;

  const gameVersion = getGameVersion(gameParam);
  if (!gameVersion) {
    return {
      title: "Game Not Found",
      description: "The requested Pokemon game version could not be found.",
    };
  }

  const generation = getGenerationForGame(gameVersion);
  const regionName = gameVersion.region;
  const pokemonCount = generation
    ? `${generation.displayName} Pokemon`
    : "Pokemon";

  return {
    title: `Play Pokemon ${gameVersion.displayName}`,
    description: `Build a random Pokemon team in Pokemon ${gameVersion.displayName}. Explore the ${regionName} region with ${pokemonCount} in this randomizer card game.`,
    alternates: {
      canonical: `https://pokemizer.com/play/${gameVersion.slug}`,
    },
  };
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
