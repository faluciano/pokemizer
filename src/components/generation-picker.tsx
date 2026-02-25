"use client";

import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { GENERATIONS } from "@/lib/starters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function GenerationPicker() {
  const router = useRouter();

  function handleSelect(gen: (typeof GENERATIONS)[number]) {
    track("generation_selected", {
      generation: gen.id,
      region: gen.region,
    });
    router.push(`/play/${gen.id}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GENERATIONS.map((gen) => (
        <Card
          key={gen.id}
          className="cursor-pointer transition-all hover:scale-[1.02] hover:border-zinc-500 hover:shadow-md"
          onClick={() => handleSelect(gen)}
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
