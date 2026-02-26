"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Pokemon, Generation, GameVersion, PokemonType } from "@/lib/types";
import { getRandomStarter } from "@/lib/pokeapi";
import {
  isDuplicate,
  isTeamFull,
  getTypeOverlap,
  getOverlappingTeamIndices,
} from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";
import { useGameState } from "@/hooks/use-game-state";
import { StarterReveal } from "@/components/starter-reveal";
import { GameHeader } from "@/components/game-header";
import { CardGrid } from "@/components/card-grid";
import { TeamDisplay } from "@/components/team-display";
import { ReplaceDialog } from "@/components/replace-dialog";
import { GameOver } from "@/components/game-over";

interface GameClientProps {
  generation: Generation;
  gameVersion: GameVersion;
  allPokemon: Pokemon[];
}

export function GameClient({ generation, gameVersion, allPokemon }: GameClientProps) {
  const router = useRouter();
  const {
    state,
    setGame,
    setStarter,
    revealCard,
    addToTeam,
    replacePokemon,
    skipPokemon,
    newRound,
    reset,
  } = useGameState();

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [revealedPokemon, setRevealedPokemon] = useState<Pokemon | null>(null);
  const [overlappingTypes, setOverlappingTypes] = useState<PokemonType[]>([]);
  const [overlappingIndices, setOverlappingIndices] = useState<number[]>([]);
  const [starterPokemon, setStarterPokemon] = useState<Pokemon | null>(null);
  const [processingReveal, setProcessingReveal] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const initRef = useRef(false);
  const teamRef = useRef(state.team);
  teamRef.current = state.team;

  // Initialize game on mount
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const starter = getRandomStarter(allPokemon);
      setStarterPokemon(starter);
      setGame(generation, gameVersion, allPokemon);
    }
  }, [allPokemon, generation, gameVersion, setGame]);

  const handleStarterContinue = useCallback(() => {
    if (starterPokemon) {
      setStarter(starterPokemon);
    }
  }, [starterPokemon, setStarter]);

  const startNewRound = useCallback(() => {
    setRevealAll(true);
    setTimeout(() => {
      setRevealAll(false);
      newRound();
      setRevealedPokemon(null);
      setProcessingReveal(false);
    }, 1200);
  }, [newRound]);

  const handleReveal = useCallback(
    (index: number) => {
      if (processingReveal || state.revealedIndex !== null) return;

      revealCard(index);
      const pokemon = state.currentCards[index];
      setRevealedPokemon(pokemon);

      setProcessingReveal(true);
      setTimeout(() => {
        // Use ref for latest team state (avoids stale closure)
        const currentTeam = teamRef.current;

        if (isDuplicate(currentTeam, pokemon)) {
          toast.warning(
            `Duplicate! ${capitalize(pokemon.name)} is already on your team.`
          );
          setTimeout(() => {
            startNewRound();
          }, 1000);
          return;
        }

        const overlap = getTypeOverlap(currentTeam, pokemon);

        if (overlap.length > 0) {
          const indices = getOverlappingTeamIndices(currentTeam, pokemon);
          // If the only overlapping members are starters, auto-skip
          const nonStarterOverlap = indices.filter((i) => !currentTeam[i].isStarter);
          if (nonStarterOverlap.length === 0) {
            toast.info(
              `${capitalize(pokemon.name)} overlaps only with your starter — skipped.`
            );
            setTimeout(() => {
              startNewRound();
            }, 1200);
            return;
          }
          setOverlappingTypes(overlap);
          setOverlappingIndices(indices);
          toast.info(
            `${capitalize(pokemon.name)} has type overlap — choose to replace or skip.`
          );
          setTimeout(() => {
            setShowReplaceDialog(true);
            setProcessingReveal(false);
          }, 800);
          return;
        }

        if (!isTeamFull(currentTeam)) {
          // No overlap, team not full — auto-add
          toast.success(`${capitalize(pokemon.name)} added to your team!`);
          addToTeam(pokemon);
          setTimeout(() => {
            startNewRound();
          }, 1200);
          return;
        }

        // Team full, no overlap, no duplicate — wasted attempt
        toast.info("Team is full! Attempt wasted.");
        setTimeout(() => {
          startNewRound();
        }, 1000);
      }, 1500);
    },
    [
      processingReveal,
      state.revealedIndex,
      state.currentCards,
      revealCard,
      addToTeam,
      startNewRound,
    ]
  );

  const handleReplace = useCallback(
    (teamIndex: number) => {
      if (revealedPokemon) {
        replacePokemon(teamIndex, revealedPokemon);
        setShowReplaceDialog(false);
        setOverlappingIndices([]);
        startNewRound();
      }
    },
    [revealedPokemon, replacePokemon, startNewRound]
  );

  const handleSkip = useCallback(() => {
    skipPokemon();
    setShowReplaceDialog(false);
    setOverlappingIndices([]);
    startNewRound();
  }, [skipPokemon, startNewRound]);

  const handleCloseDialog = useCallback(() => {
    handleSkip();
  }, [handleSkip]);

  const handlePlayAgain = useCallback(() => {
    initRef.current = false;
    const starter = getRandomStarter(allPokemon);
    setStarterPokemon(starter);
    setGame(generation, gameVersion, allPokemon);
  }, [allPokemon, generation, gameVersion, setGame]);

  const handleNewGeneration = useCallback(() => {
    reset();
    router.push("/");
  }, [reset, router]);

  // Render based on phase
  if (state.phase === "picking-generation" || state.phase === "starter-reveal") {
    if (starterPokemon && state.gameVersion) {
      return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
          <StarterReveal
            starter={starterPokemon}
            gameVersion={state.gameVersion}
            onContinue={handleStarterContinue}
          />
        </main>
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-400">Setting up game...</p>
      </main>
    );
  }

  if (state.phase === "game-over" && state.gameVersion) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
        <GameOver
          team={state.team}
          attempts={state.attempts}
          generation={state.generation!}
          gameVersion={state.gameVersion}
          onPlayAgain={handlePlayAgain}
          onNewGeneration={handleNewGeneration}
        />
      </main>
    );
  }

  if (state.phase === "playing" && state.gameVersion) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <GameHeader gameVersion={state.gameVersion} />

          <section className="text-center">
            <h3 className="mb-4 text-lg font-semibold text-zinc-300">
              Pick a card
            </h3>
            <CardGrid
              cards={state.currentCards}
              revealedIndex={state.revealedIndex}
              revealAll={revealAll}
              onReveal={handleReveal}
              disabled={processingReveal}
            />
          </section>

          <section>
            <h3 className="mb-4 text-center text-lg font-semibold text-zinc-300">
              Your Team
            </h3>
            <TeamDisplay team={state.team} />
          </section>
        </div>

        {revealedPokemon && (
          <ReplaceDialog
            open={showReplaceDialog}
            pokemon={revealedPokemon}
            team={state.team}
            overlappingTypes={overlappingTypes}
            overlappingIndices={overlappingIndices}
            onReplace={handleReplace}
            onSkip={handleSkip}
            onClose={handleCloseDialog}
          />
        )}
      </main>
    );
  }

  return null;
}
