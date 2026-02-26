"use client";

import type { EvolutionLine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, ArrowLeftRight, SkipForward } from "lucide-react";

type ActionScenario = "add" | "add-with-overlap" | "replace-or-skip";

interface ActionBarProps {
  line: EvolutionLine;
  scenario: ActionScenario;
  coverageDelta: { before: number; after: number; delta: number };
  onAdd: () => void;
  onReplace: () => void;
  onSkip: () => void;
  className?: string;
}

export function ActionBar({
  line,
  scenario,
  coverageDelta,
  onAdd,
  onReplace,
  onSkip,
  className,
}: ActionBarProps) {
  const { before, after, delta } = coverageDelta;

  // Determine glow color based on overlap level
  const glowClass =
    scenario === "add"
      ? "border-green-500/50 shadow-[0_0_12px_2px_rgba(34,197,94,0.15)]"
      : scenario === "add-with-overlap"
        ? "border-amber-500/50 shadow-[0_0_12px_2px_rgba(245,158,11,0.15)]"
        : "border-orange-500/50 shadow-[0_0_12px_2px_rgba(249,115,22,0.15)]";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border bg-zinc-900/80 p-4 backdrop-blur-sm",
        glowClass,
        className,
      )}
    >
      {/* Coverage delta */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">Coverage:</span>
        <span className="font-mono font-semibold text-zinc-200">
          {before}/18
        </span>
        <span className="text-zinc-500">→</span>
        <span className="font-mono font-semibold text-zinc-200">
          {after}/18
        </span>
        {delta > 0 && (
          <span className="font-mono font-semibold text-green-400">
            (+{delta})
          </span>
        )}
        {delta === 0 && (
          <span className="font-mono text-zinc-500">(+0)</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {scenario === "add" && (
          <Button onClick={onAdd} className="gap-1.5">
            <Plus className="size-4" />
            Add
          </Button>
        )}

        {scenario === "add-with-overlap" && (
          <>
            <Button onClick={onAdd} variant="outline" className="gap-1.5">
              <Plus className="size-4" />
              Add Anyway
            </Button>
            <Button onClick={onReplace} variant="secondary" className="gap-1.5">
              <ArrowLeftRight className="size-4" />
              Replace
            </Button>
          </>
        )}

        {scenario === "replace-or-skip" && (
          <Button onClick={onReplace} variant="secondary" className="gap-1.5">
            <ArrowLeftRight className="size-4" />
            Replace
          </Button>
        )}

        <Button onClick={onSkip} variant="ghost" className="gap-1.5 text-zinc-400">
          <SkipForward className="size-4" />
          Skip
        </Button>
      </div>
    </div>
  );
}
