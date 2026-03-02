"use client";

import Image from "next/image";
import type { EvolutionLine } from "@/lib/types";
import { MAX_TEAM_SIZE } from "@/lib/game-logic";
import { TypeBadge } from "@/components/type-badge";
import { cn, capitalize } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";

interface TeamDisplayProps {
  team: EvolutionLine[];
}

export function TeamDisplay({ team }: TeamDisplayProps) {
  const slots = Array.from({ length: MAX_TEAM_SIZE }, (_, i) => i);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {slots.map((slotIndex) => {
        const line = team[slotIndex];

        if (line) {
          const baseStage = line.stages[0];

          return (
            <div
              key={line.lineId}
              className="relative flex w-[110px] flex-col items-center rounded-lg border border-zinc-700 bg-zinc-800/50 p-2"
            >
              {line.isStarter && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-yellow-500 p-0.5">
                  <Star className="size-3 fill-white text-white" />
                </div>
              )}
              <div className="relative h-[64px] w-[64px]">
                <Image
                  src={baseStage.sprite}
                  alt={baseStage.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <p className="mt-1 text-xs font-medium text-white truncate w-full text-center">
                {capitalize(baseStage.name)}
              </p>
              <div className="mt-1 flex gap-0.5">
                {line.types.map((type) => (
                  <TypeBadge
                    key={type}
                    type={type}
                    className="text-[9px] px-1 py-0"
                  />
                ))}
              </div>
              {baseStage.locations.length > 0 && (
                <div className="mt-0.5 flex items-center gap-0.5 text-zinc-500">
                  <MapPin className="size-2.5" />
                  <span className="text-[8px]">{baseStage.locations.length} routes</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={`empty-${slotIndex}`}
            className={cn(
              "flex w-[110px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/30 p-2",
              "h-[120px]"
            )}
          >
            <span className="text-lg font-bold text-zinc-700">
              {slotIndex + 1}
            </span>
            <span className="text-[10px] text-zinc-600">Empty</span>
          </div>
        );
      })}
    </div>
  );
}
