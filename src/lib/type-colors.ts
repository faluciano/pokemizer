import type { PokemonType } from "./types";

export const TYPE_COLORS: Record<PokemonType, { bg: string; text: string; border: string }> = {
  normal:   { bg: "bg-stone-400",    text: "text-white", border: "border-stone-400" },
  fire:     { bg: "bg-orange-500",   text: "text-white", border: "border-orange-500" },
  water:    { bg: "bg-blue-500",     text: "text-white", border: "border-blue-500" },
  electric: { bg: "bg-yellow-400",   text: "text-black", border: "border-yellow-400" },
  grass:    { bg: "bg-green-500",    text: "text-white", border: "border-green-500" },
  ice:      { bg: "bg-cyan-300",     text: "text-black", border: "border-cyan-300" },
  fighting: { bg: "bg-red-700",      text: "text-white", border: "border-red-700" },
  poison:   { bg: "bg-purple-500",   text: "text-white", border: "border-purple-500" },
  ground:   { bg: "bg-amber-600",    text: "text-white", border: "border-amber-600" },
  flying:   { bg: "bg-indigo-300",   text: "text-black", border: "border-indigo-300" },
  psychic:  { bg: "bg-pink-500",     text: "text-white", border: "border-pink-500" },
  bug:      { bg: "bg-lime-500",     text: "text-white", border: "border-lime-500" },
  rock:     { bg: "bg-yellow-700",   text: "text-white", border: "border-yellow-700" },
  ghost:    { bg: "bg-purple-700",   text: "text-white", border: "border-purple-700" },
  dragon:   { bg: "bg-violet-600",   text: "text-white", border: "border-violet-600" },
  dark:     { bg: "bg-stone-700",    text: "text-white", border: "border-stone-700" },
  steel:    { bg: "bg-slate-400",    text: "text-black", border: "border-slate-400" },
  fairy:    { bg: "bg-pink-300",     text: "text-black", border: "border-pink-300" },
};
