"use client";

import type { BaseStats, PokemonType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAT_LABELS = ["HP", "Atk", "Def", "Sp.Atk", "Sp.Def", "Spd"] as const;
const STAT_KEYS: (keyof BaseStats)[] = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];
const MAX_STAT = 200;
const SIZE = 160;
const CENTER = SIZE / 2;
const RADIUS = 55;
const LABEL_RADIUS = RADIUS + 20;

// Type colors for the filled polygon
const TYPE_FILL_COLORS: Record<PokemonType, string> = {
  normal: "rgba(168, 168, 120, 0.4)",
  fire: "rgba(240, 128, 48, 0.4)",
  water: "rgba(104, 144, 240, 0.4)",
  electric: "rgba(248, 208, 48, 0.4)",
  grass: "rgba(120, 200, 80, 0.4)",
  ice: "rgba(152, 216, 216, 0.4)",
  fighting: "rgba(192, 48, 40, 0.4)",
  poison: "rgba(160, 64, 160, 0.4)",
  ground: "rgba(224, 192, 104, 0.4)",
  flying: "rgba(168, 144, 240, 0.4)",
  psychic: "rgba(248, 88, 136, 0.4)",
  bug: "rgba(168, 184, 32, 0.4)",
  rock: "rgba(184, 160, 56, 0.4)",
  ghost: "rgba(112, 88, 152, 0.4)",
  dragon: "rgba(112, 56, 248, 0.4)",
  dark: "rgba(112, 88, 72, 0.4)",
  steel: "rgba(184, 184, 208, 0.4)",
  fairy: "rgba(238, 153, 172, 0.4)",
};

const TYPE_STROKE_COLORS: Record<PokemonType, string> = {
  normal: "rgba(168, 168, 120, 0.8)",
  fire: "rgba(240, 128, 48, 0.8)",
  water: "rgba(104, 144, 240, 0.8)",
  electric: "rgba(248, 208, 48, 0.8)",
  grass: "rgba(120, 200, 80, 0.8)",
  ice: "rgba(152, 216, 216, 0.8)",
  fighting: "rgba(192, 48, 40, 0.8)",
  poison: "rgba(160, 64, 160, 0.8)",
  ground: "rgba(224, 192, 104, 0.8)",
  flying: "rgba(168, 144, 240, 0.8)",
  psychic: "rgba(248, 88, 136, 0.8)",
  bug: "rgba(168, 184, 32, 0.8)",
  rock: "rgba(184, 160, 56, 0.8)",
  ghost: "rgba(112, 88, 152, 0.8)",
  dragon: "rgba(112, 56, 248, 0.8)",
  dark: "rgba(112, 88, 72, 0.8)",
  steel: "rgba(184, 184, 208, 0.8)",
  fairy: "rgba(238, 153, 172, 0.8)",
};

function getHexPoint(centerX: number, centerY: number, radius: number, index: number): [number, number] {
  // Start from top (–90°), go clockwise
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
  return [
    centerX + radius * Math.cos(angle),
    centerY + radius * Math.sin(angle),
  ];
}

function getHexPoints(centerX: number, centerY: number, radius: number): string {
  return Array.from({ length: 6 })
    .map((_, i) => getHexPoint(centerX, centerY, radius, i).join(","))
    .join(" ");
}

interface StatChartProps {
  stats: BaseStats;
  primaryType: PokemonType;
  className?: string;
}

export function StatChart({ stats, primaryType, className }: StatChartProps) {
  const statValues = STAT_KEYS.map((key) => Math.min(stats[key] / MAX_STAT, 1));

  const dataPoints = statValues
    .map((val, i) => getHexPoint(CENTER, CENTER, RADIUS * val, i).join(","))
    .join(" ");

  return (
    <div className={cn("inline-block", className)}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background hexagon rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={getHexPoints(CENTER, CENTER, RADIUS * scale)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const [x, y] = getHexPoint(CENTER, CENTER, RADIUS, i);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill={TYPE_FILL_COLORS[primaryType]}
          stroke={TYPE_STROKE_COLORS[primaryType]}
          strokeWidth={1.5}
        />

        {/* Stat labels and values */}
        {STAT_LABELS.map((label, i) => {
          const [x, y] = getHexPoint(CENTER, CENTER, LABEL_RADIUS, i);
          const value = stats[STAT_KEYS[i]];
          return (
            <g key={label}>
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-zinc-400 text-[8px] font-medium"
              >
                {label}
              </text>
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-zinc-300 text-[7px] font-bold"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
