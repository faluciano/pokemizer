import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameVersion, getGenerationForGame, GAME_VERSIONS } from "@/lib/games";
import { getGameData } from "@/data";
import { GameClient } from "./game-client";
import { GameSeoContent } from "./seo-content";

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

  const shortDescription = `Build a random Pokemon ${gameVersion.displayName} team — flip cards to assemble six Pokemon from the ${regionName} Pokedex.`;

  return {
    title: `Play Pokemon ${gameVersion.displayName}`,
    description: `Build a random Pokemon team in Pokemon ${gameVersion.displayName}. Explore the ${regionName} region with ${pokemonCount} in this randomizer card game.`,
    alternates: {
      canonical: `https://pokemizer.com/play/${gameVersion.slug}`,
    },
    openGraph: {
      title: `Pokemon ${gameVersion.displayName} Team Randomizer`,
      description: shortDescription,
      url: `https://pokemizer.com/play/${gameVersion.slug}`,
      siteName: "Pokemizer",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Pokemon ${gameVersion.displayName} Team Randomizer`,
      description: shortDescription,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Pokemon ${gameVersion.displayName} Team Randomizer`,
    url: `https://pokemizer.com/play/${gameVersion.slug}`,
    description: `Build a random Pokemon team for Pokemon ${gameVersion.displayName} (${gameVersion.region} region, ${generation.displayName}) in a card-flipping randomizer game.`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Pokemizer",
      url: "https://pokemizer.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GameClient
        generation={generation}
        gameVersion={gameVersion}
        allPokemon={allPokemon}
      />
      <GameSeoContent
        gameVersion={gameVersion}
        generation={generation}
        allPokemon={allPokemon}
      />
    </>
  );
}
