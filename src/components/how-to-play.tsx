"use client";

import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const rules = [
  {
    emoji: "🌍",
    title: "Choose a generation",
    description: "Pick a Pokemon generation and game version to play with.",
  },
  {
    emoji: "🎲",
    title: "Get a random starter",
    description:
      "One of the 3 starters from that generation is randomly assigned to your team.",
  },
  {
    emoji: "🃏",
    title: "Pick cards",
    description:
      "Each round, face-down cards are dealt. Pick one to reveal a random Pokemon.",
  },
  {
    emoji: "⭐",
    title: "Build your team",
    description:
      "Add Pokemon to your team (max 6). Pay attention to type coverage!",
  },
  {
    emoji: "⚖️",
    title: "Type overlap decisions",
    description:
      "When a Pokemon shares types with your team, you can add it anyway, replace a team member, or skip.",
  },
  {
    emoji: "🔒",
    title: "Full team strategy",
    description:
      "Once you have 6 Pokemon, you can only replace or skip. Your starter can never be replaced.",
  },
  {
    emoji: "💨",
    title: "Duplicates waste a pick",
    description:
      "If you reveal a Pokemon already on your team, that attempt is wasted.",
  },
  {
    emoji: "🏁",
    title: "Game ends",
    description: "The game ends when your team is full or the pool runs out.",
  },
];

export function HowToPlay() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-zinc-400">
          <HelpCircle className="size-4" />
          How to Play
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
          <DialogDescription>
            Build the ultimate Pokemon team using randomized cards.
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {rules.map((rule, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm">
                {rule.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200">
                  {rule.title}
                </p>
                <p className="text-sm text-zinc-400">{rule.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
