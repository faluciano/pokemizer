"use client";

import Image from "next/image";
import type { Pokemon, PokemonType } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface ReplaceDialogProps {
  open: boolean;
  pokemon: Pokemon;
  team: Pokemon[];
  overlappingTypes: PokemonType[];
  onReplace: (replaceIndex: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function ReplaceDialog({
  open,
  pokemon,
  team,
  overlappingTypes,
  onReplace,
  onSkip,
  onClose,
}: ReplaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Type Overlap Detected</DialogTitle>
          <DialogDescription>
            {capitalize(pokemon.name)} shares types with your team. Replace a
            team member or skip.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-[64px] w-[64px]">
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            <div>
              <p className="font-semibold text-white">
                {capitalize(pokemon.name)}
              </p>
              <div className="mt-1 flex gap-1">
                {pokemon.types.map((type) => (
                  <TypeBadge key={type} type={type} className="text-[10px] px-1.5 py-0" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-zinc-400">Overlapping:</span>
            {overlappingTypes.map((type) => (
              <TypeBadge key={type} type={type} className="text-[10px] px-1.5 py-0" />
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Your Team
          </p>
          {team.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800/50 p-2"
            >
              <div className="flex items-center gap-2">
                <div className="relative h-[40px] w-[40px]">
                  <Image
                    src={member.sprite}
                    alt={member.name}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white">
                      {capitalize(member.name)}
                    </span>
                    {member.isStarter && (
                      <Star className="size-3 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {member.types.map((type) => (
                      <TypeBadge
                        key={type}
                        type={type}
                        className="text-[9px] px-1 py-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReplace(index)}
                disabled={member.isStarter}
              >
                {member.isStarter ? "Starter" : "Replace"}
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
