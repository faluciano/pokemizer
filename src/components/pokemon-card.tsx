"use client";

import Image from "next/image";
import type { Pokemon } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/type-colors";
import { TypeBadge } from "@/components/type-badge";
import { cn, capitalize } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PokemonCardProps {
  pokemon: Pokemon | null;
  faceDown: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PokemonCard({
  pokemon,
  faceDown,
  onClick,
  disabled = false,
  className,
}: PokemonCardProps) {
  const [isFlipped, setIsFlipped] = useState(!faceDown);

  useEffect(() => {
    setIsFlipped(!faceDown);
  }, [faceDown]);

  const primaryType = pokemon?.types[0];
  const borderColor = primaryType ? TYPE_COLORS[primaryType].border : "";

  return (
    <div
      className={cn("perspective w-[170px] shrink-0", className)}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <div
        className={cn(
          "flip-card-inner relative h-[240px] w-full cursor-pointer",
          isFlipped && "flipped",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* Back face (question mark) */}
        <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-zinc-600 bg-zinc-800 shadow-lg">
          <div className="absolute inset-2 rounded-lg border border-zinc-700 opacity-50" />
          <div className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
          <span className="relative text-5xl font-bold text-zinc-500">?</span>
        </div>

        {/* Front face (Pokemon) */}
        <div
          className={cn(
            "flip-card-back absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-zinc-900 shadow-lg",
            borderColor || "border-zinc-600"
          )}
        >
          {pokemon && (
            <>
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
                  TYPE_COLORS[pokemon.types[0]].bg
                )}
              />
              <div className="relative mt-2 h-[120px] w-[120px]">
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  fill
                  loading="eager"
                  className="object-contain drop-shadow-lg"
                  sizes="120px"
                />
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {capitalize(pokemon.name)}
              </p>
              <div className="mt-1.5 flex gap-1">
                {pokemon.types.map((type) => (
                  <TypeBadge key={type} type={type} className="text-[10px] px-1.5 py-0" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
