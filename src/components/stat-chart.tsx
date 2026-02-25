"use client";

import type { BaseStats, PokemonType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAT_ROWS: { label: string; key: keyof BaseStats; color: string }[] = [
  { label: "HP", key: "hp", color: "bg-red-500" },
  { label: "Attack", key: "attack", color: "bg-orange-500" },
  { label: "Defense", key: "defense", color: "bg-yellow-500" },
  { label: "Sp. Atk", key: "spAtk", color: "bg-blue-400" },
  { label: "Sp. Def", key: "spDef", color: "bg-green-400" },
  { label: "Speed", key: "speed", color: "bg-pink-400" },
];

const MAX_STAT = 255;

interface StatChartProps {
  stats: BaseStats;
  primaryType?: PokemonType;
  className?: string;
}

export function StatChart({ stats, className }: StatChartProps) {
  const total = STAT_ROWS.reduce((sum, row) => sum + stats[row.key], 0);

  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-1">
        {STAT_ROWS.map((row) => {
          const value = stats[row.key];
          const pct = Math.min((value / MAX_STAT) * 100, 100);
          return (
            <div key={row.key} className="flex items-center gap-1.5">
              <span className="w-[46px] shrink-0 text-right text-[10px] font-medium text-zinc-400">
                {row.label}
              </span>
              <span className="w-[26px] shrink-0 text-right text-[10px] font-bold text-zinc-200 tabular-nums">
                {value}
              </span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-zinc-700/50">
                <div
                  className={cn("h-full rounded-full", row.color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="w-[46px] shrink-0 text-right text-[10px] font-medium text-zinc-400">
          Total
        </span>
        <span className="w-[26px] shrink-0 text-right text-[10px] font-bold text-white tabular-nums">
          {total}
        </span>
      </div>
    </div>
  );
}
