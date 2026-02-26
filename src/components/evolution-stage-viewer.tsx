"use client";

import { useState } from "react";
import Image from "next/image";
import type { EvolutionLine } from "@/lib/types";
import { TypeBadge } from "@/components/type-badge";
import { StatChart } from "@/components/stat-chart";

import { cn, capitalize } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface EvolutionStageViewerProps {
  line: EvolutionLine;
  size?: "sm" | "lg";
  className?: string;
}

export function EvolutionStageViewer({
  line,
  size = "lg",
  className,
}: EvolutionStageViewerProps) {
  const [selectedStage, setSelectedStage] = useState(0);
  const stages = line.stages;
  const current = stages[selectedStage];
  const hasEvolutions = stages.length > 1;

  const spriteSize = size === "sm" ? 48 : 80;
  const stripSpriteSize = size === "sm" ? 24 : 32;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Sprite */}
      <div
        className={cn(
          "relative shrink-0 transition-opacity duration-200",
          size === "sm" ? "h-12 w-12" : "h-[80px] w-[80px]"
        )}
        key={current.id}
      >
        <Image
          src={current.sprite}
          alt={current.name}
          fill
          className="object-contain"
          sizes={`${spriteSize}px`}
        />
      </div>

      {/* Name */}
      <p
        className={cn(
          "transition-opacity duration-200",
          size === "sm"
            ? "text-[10px] font-medium text-zinc-300"
            : "text-sm font-semibold text-white"
        )}
      >
        {capitalize(current.name)}
      </p>

      {/* Type badges */}
      <div className="mt-0.5 flex items-center gap-1 transition-opacity duration-200">
        {current.types.map((type) => (
          <TypeBadge
            key={type}
            type={type}
            className={cn(
              size === "sm" ? "text-[8px] px-0.5 py-0" : "text-[9px] px-1 py-0"
            )}
          />
        ))}
      </div>

      {/* Clickable evolution strip */}
      {hasEvolutions && (
        <div className="mt-1.5 flex items-center gap-1">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="size-3 shrink-0 text-zinc-500" />
              )}
              <button
                type="button"
                onClick={() => setSelectedStage(index)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg p-0.5 transition-all duration-200",
                  selectedStage === index
                    ? "ring-2 ring-primary"
                    : "opacity-50 hover:opacity-80"
                )}
              >
                <div
                  className="relative shrink-0"
                  style={{
                    width: stripSpriteSize,
                    height: stripSpriteSize,
                  }}
                >
                  <Image
                    src={stage.sprite}
                    alt={stage.name}
                    fill
                    className="object-contain"
                    sizes={`${stripSpriteSize}px`}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stat chart */}
      <StatChart
        stats={current.stats}
        className={size === "sm" ? "mt-1" : "mt-2"}
      />
    </div>
  );
}
