"use client";

import Image from "next/image";
import type { EvolutionLine, GameVersion } from "@/lib/types";
import { TypeBadge } from "@/components/type-badge";
import { EvolutionStrip } from "@/components/evolution-strip";
import { Button } from "@/components/ui/button";
import { TYPE_COLORS } from "@/lib/type-colors";
import { cn, capitalize } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StarterRevealProps {
  starter: EvolutionLine;
  gameVersion: GameVersion;
  onContinue: () => void;
}

export function StarterReveal({
  starter,
  gameVersion,
  onContinue,
}: StarterRevealProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const baseStage = starter.stages[0];
  const borderColor = TYPE_COLORS[starter.types[0]].border;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-lg text-zinc-400">
          {gameVersion.displayName} &middot; {gameVersion.region}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Your starter is...
        </h2>
      </div>

      <div
        className={cn(
          "flex flex-col items-center rounded-2xl border-2 bg-zinc-900 p-6 shadow-2xl transition-all duration-700",
          borderColor,
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl",
            TYPE_COLORS[starter.types[0]].bg
          )}
        />
        <div className="relative h-[200px] w-[200px]">
          <Image
            src={baseStage.sprite}
            alt={baseStage.name}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="200px"
            priority
          />
        </div>
        <h3 className="mt-4 text-3xl font-bold text-white">
          {capitalize(baseStage.name)}
        </h3>
        <div className="mt-3 flex gap-2">
          {starter.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
        {starter.stages.length > 1 && (
          <EvolutionStrip
            stages={starter.stages}
            size="md"
            className="mt-4"
          />
        )}
      </div>

      <Button
        size="lg"
        onClick={onContinue}
        className={cn(
          "transition-all duration-500",
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        Continue
      </Button>
    </div>
  );
}
