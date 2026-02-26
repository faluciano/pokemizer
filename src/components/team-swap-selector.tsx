"use client";

import Image from "next/image";
import type { EvolutionLine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn, capitalize } from "@/lib/utils";
import { TypeBadge } from "@/components/type-badge";
import { Star, X } from "lucide-react";

interface TeamSwapSelectorProps {
  team: EvolutionLine[];
  replaceableIndices: number[];
  onSelect: (index: number) => void;
  onCancel: () => void;
  className?: string;
}

export function TeamSwapSelector({
  team,
  replaceableIndices,
  onSelect,
  onCancel,
  className,
}: TeamSwapSelectorProps) {
  const replaceableSet = new Set(replaceableIndices);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-300">
          Select a team member to replace
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onCancel}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {team.map((line, index) => {
          const baseStage = line.stages[0];
          const isReplaceable = replaceableSet.has(index);

          return (
            <button
              key={line.lineId}
              onClick={() => isReplaceable && onSelect(index)}
              disabled={!isReplaceable}
              className={cn(
                "relative flex w-[100px] flex-col items-center rounded-lg border p-2 transition-all",
                isReplaceable
                  ? "border-red-500/50 bg-zinc-800/80 hover:border-red-400 hover:bg-red-950/30 cursor-pointer"
                  : "border-zinc-700/50 bg-zinc-900/50 opacity-50 cursor-not-allowed",
              )}
            >
              {line.isStarter && (
                <div className="absolute -top-1 -right-1 rounded-full bg-yellow-500 p-0.5">
                  <Star className="size-2.5 fill-white text-white" />
                </div>
              )}
              <div className="relative h-[40px] w-[40px]">
                <Image
                  src={baseStage.sprite}
                  alt={baseStage.name}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <p className="mt-0.5 text-[10px] font-medium text-zinc-300 truncate w-full text-center">
                {capitalize(baseStage.name)}
              </p>
              <div className="mt-0.5 flex gap-0.5">
                {line.types.map((type) => (
                  <TypeBadge
                    key={type}
                    type={type}
                    className="text-[8px] px-0.5 py-0"
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
