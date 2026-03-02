"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { GENERATIONS } from "@/lib/starters";
import { getGamesByGeneration } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function GenerationPicker() {
  const router = useRouter();
  const [selectedGenId, setSelectedGenId] = useState<number | null>(null);

  const selectedGen = selectedGenId
    ? GENERATIONS.find((g) => g.id === selectedGenId)
    : null;
  const games = selectedGenId ? getGamesByGeneration(selectedGenId) : [];

  function handleSelectGeneration(genId: number) {
    setSelectedGenId(genId);
  }

  function handleSelectGame(game: ReturnType<typeof getGamesByGeneration>[number]) {
    track("generation_selected", {
      generation: game.generationId,
      region: game.region,
      game: game.slug,
    });
    router.push(`/play/${game.slug}`);
  }

  function handleBack() {
    setSelectedGenId(null);
  }

  // Show game picker for selected generation
  if (selectedGen && games.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h3 className="text-lg font-bold text-white">
              {selectedGen.displayName}
            </h3>
            <p className="text-sm text-zinc-400">{selectedGen.region}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card
              key={game.slug}
              className="cursor-pointer transition-all hover:scale-[1.02] hover:border-zinc-500 hover:shadow-md"
              onClick={() => handleSelectGame(game)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{game.displayName}</CardTitle>
                <CardDescription>
                  {game.region}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  {game.starterIds.map((id) => (
                    <div key={id} className="relative h-[60px] w-[60px]">
                      <Image
                        src={getSpriteUrl(id)}
                        alt={`Starter #${id}`}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show generation grid
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GENERATIONS.map((gen) => (
        <Card
          key={gen.id}
          className="cursor-pointer transition-all hover:scale-[1.02] hover:border-zinc-500 hover:shadow-md"
          onClick={() => handleSelectGeneration(gen.id)}
        >
          <CardHeader>
            <CardTitle>{gen.displayName}</CardTitle>
            <CardDescription>{gen.region}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2">
              {gen.starterIds.map((id) => (
                <div key={id} className="relative h-[72px] w-[72px]">
                  <Image
                    src={getSpriteUrl(id)}
                    alt={`Starter #${id}`}
                    fill
                    className="object-contain"
                    sizes="72px"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
