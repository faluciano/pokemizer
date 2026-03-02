"use client";

import type { EvolutionLine } from "@/lib/types";
import { PokemonCard } from "@/components/pokemon-card";

interface CardGridProps {
  cards: EvolutionLine[];
  revealedIndex: number | null;
  revealAll?: boolean;
  duplicateIndex?: number | null;
  onReveal: (index: number) => void;
  disabled: boolean;
}

export function CardGrid({
  cards,
  revealedIndex,
  revealAll = false,
  duplicateIndex = null,
  onReveal,
  disabled,
}: CardGridProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map((line, index) => (
        <PokemonCard
          key={`${line.lineId}-${index}`}
          line={line}
          faceDown={revealAll ? false : revealedIndex !== index}
          isDuplicate={duplicateIndex === index}
          onClick={() => onReveal(index)}
          disabled={disabled || revealedIndex !== null}
          className={revealAll && revealedIndex !== index ? "opacity-60" : ""}
        />
      ))}
    </div>
  );
}
