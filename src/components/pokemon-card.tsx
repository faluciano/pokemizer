"use client";

import type { Pokemon } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/type-colors";
import { TypeBadge } from "@/components/type-badge";
import { cn, capitalize } from "@/lib/utils";

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
  const revealed = !faceDown;
  const primaryType = pokemon?.types[0];
  const borderColor = primaryType ? TYPE_COLORS[primaryType].border : "";

  return (
    <div
      className={cn(
        "relative h-[240px] w-[170px] shrink-0 select-none",
        disabled && !revealed && "opacity-50",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      {/* Back face (question mark) — visible when face down */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-zinc-600 bg-zinc-800 shadow-lg transition-opacity duration-300",
          revealed ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <div className="absolute inset-2 rounded-lg border border-zinc-700 opacity-50" />
        <div className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
        <span className="relative text-5xl font-bold text-zinc-500">?</span>
      </div>

      {/* Front face (Pokemon) — visible when revealed */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-zinc-900 shadow-lg transition-opacity duration-300",
          revealed ? "opacity-100" : "pointer-events-none opacity-0",
          borderColor || "border-zinc-600",
        )}
      >
        {pokemon && (
          <>
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
                TYPE_COLORS[pokemon.types[0]].bg,
              )}
            />
            <div className="mt-2 h-[120px] w-[120px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                width={120}
                height={120}
                className="h-full w-full object-contain drop-shadow-lg"
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
  );
}
