"use client";

import Image from "next/image";
import type { EvolutionStage } from "@/lib/types";
import { cn, capitalize } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface EvolutionStripProps {
  stages: EvolutionStage[];
  highlightStage?: number;  // stage index to highlight (e.g., 0 for base form)
  size?: "sm" | "md";       // sm = 32px sprites, md = 48px sprites
  className?: string;
}

export function EvolutionStrip({
  stages,
  highlightStage,
  size = "sm",
  className,
}: EvolutionStripProps) {
  const spriteSize = size === "sm" ? 32 : 48;
  const imageSizes = `${spriteSize}px`;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="size-3 text-zinc-500 shrink-0" />
          )}
          <div
            className={cn(
              "flex flex-col items-center gap-0.5",
              highlightStage === index && "ring-2 ring-yellow-400/50 rounded-lg p-0.5"
            )}
          >
            <div
              className="relative shrink-0"
              style={{ width: spriteSize, height: spriteSize }}
            >
              <Image
                src={stage.sprite}
                alt={stage.name}
                fill
                className="object-contain"
                sizes={imageSizes}
              />
            </div>
            {size === "md" && (
              <span className="text-[9px] text-zinc-400 truncate max-w-[48px] text-center">
                {capitalize(stage.name)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
