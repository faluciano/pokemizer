"use client";

import { useEffect } from "react";
import type { Pokemon } from "@/lib/types";
import { PokemonCard } from "@/components/pokemon-card";

interface CardGridProps {
  cards: Pokemon[];
  revealedIndex: number | null;
  revealAll?: boolean;
  onReveal: (index: number) => void;
  disabled: boolean;
}

export function CardGrid({
  cards,
  revealedIndex,
  revealAll = false,
  onReveal,
  disabled,
}: CardGridProps) {
  // Preload all card sprites into browser cache when cards are dealt
  useEffect(() => {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.sprite;
    });
  }, [cards]);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map((card, index) => (
        <PokemonCard
          key={`${card.id}-${index}`}
          pokemon={card}
          faceDown={revealAll ? false : revealedIndex !== index}
          onClick={() => onReveal(index)}
          disabled={disabled || revealedIndex !== null}
          className={revealAll && revealedIndex !== index ? "opacity-60" : ""}
        />
      ))}
    </div>
  );
}
