"use client";

import type { EvolutionLine } from "@/lib/types";
import { TYPE_COLORS, TYPE_GLOW_COLORS } from "@/lib/type-colors";
import { TypeBadge } from "@/components/type-badge";
import { EvolutionStrip } from "@/components/evolution-strip";
import { cn, capitalize } from "@/lib/utils";

interface PokemonCardProps {
  line: EvolutionLine | null;
  faceDown: boolean;
  onClick?: () => void;
  disabled?: boolean;
  isDuplicate?: boolean;
  className?: string;
}

export function PokemonCard({
  line,
  faceDown,
  onClick,
  disabled = false,
  isDuplicate = false,
  className,
}: PokemonCardProps) {
  const revealed = !faceDown;
  const primaryType = line?.types[0];
  const borderColor = primaryType ? TYPE_COLORS[primaryType].border : "";
  const baseStage = line?.stages[0];

  return (
    <div
      className={cn(
        "perspective relative h-[240px] w-[170px] shrink-0 select-none",
        disabled && !revealed && "opacity-50",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        isDuplicate && revealed && "card-shake",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
        className,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={!disabled && onClick ? 0 : undefined}
      aria-label={faceDown ? "Face-down card" : baseStage ? capitalize(baseStage.name) : "Card"}
      aria-disabled={disabled || undefined}
      onClick={!disabled && onClick ? onClick : undefined}
      onKeyDown={!disabled && onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={cn("flip-card-inner", revealed && "flipped")}>
        {/* Back face (question mark) — visible when face down */}
        <div
          className={cn(
            "flip-card-face flip-card-back flex flex-col items-center justify-center rounded-xl border-2 bg-zinc-800 shadow-lg",
            "border-zinc-600",
          )}
        >
          <div className="absolute inset-2 rounded-lg border border-zinc-700 opacity-50" />
          <div className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
          <span className="relative text-5xl font-bold text-zinc-500">?</span>
        </div>

        {/* Front face (Pokemon) — visible when revealed */}
        <div
          className={cn(
            "flip-card-face flip-card-front flex flex-col items-center rounded-xl border-2 bg-zinc-900 shadow-lg",
            borderColor || "border-zinc-600",
          )}
          style={primaryType ? { boxShadow: `0 0 15px 2px ${TYPE_GLOW_COLORS[primaryType]}40` } : undefined}
        >
          {line && baseStage && (
            <>
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
                  TYPE_COLORS[line.types[0]].bg,
                )}
              />
              <div className="mt-2 h-[120px] w-[120px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={baseStage.sprite}
                  alt={baseStage.name}
                  width={120}
                  height={120}
                  className="h-full w-full object-contain drop-shadow-lg"
                />
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {capitalize(baseStage.name)}
              </p>
              <div className="mt-1.5 flex gap-1">
                {line.types.map((type) => (
                  <TypeBadge key={type} type={type} className="text-[10px] px-1.5 py-0" />
                ))}
              </div>
              {line.stages.length > 1 && (
                <EvolutionStrip
                  stages={line.stages}
                  size="sm"
                  className="mt-1.5"
                />
              )}
            </>
          )}
          {isDuplicate && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-900/60">
              <span className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white -rotate-12 shadow-lg">
                DUPLICATE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
