"use client";

import { useEffect } from "react";
import type { Pokemon } from "@/lib/types";
import { PokemonCard } from "@/components/pokemon-card";

interface CardGridProps {
  cards: Pokemon[];
  revealedIndex: number | null;
  onReveal: (index: number) => void;
  disabled: boolean;
}

export function CardGrid({
  cards,
  revealedIndex,
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
          faceDown={revealedIndex !== index}
          onClick={() => onReveal(index)}
          disabled={disabled || revealedIndex !== null}
        />
      ))}
    </div>
  );
}
