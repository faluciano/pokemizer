"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Pokemon, Generation, PokemonType } from "@/lib/types";
import { getRandomStarter } from "@/lib/pokeapi";
import {
  isDuplicate,
  isTeamFull,
  getTypeOverlap,
  MAX_ATTEMPTS,
  MAX_TEAM_SIZE,
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
  allPokemon: Pokemon[];
}

export function GameClient({ generation, allPokemon }: GameClientProps) {
  const router = useRouter();
  const {
    state,
    setGeneration,
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
  const [starterPokemon, setStarterPokemon] = useState<Pokemon | null>(null);
  const [processingReveal, setProcessingReveal] = useState(false);
  const initRef = useRef(false);
  const teamRef = useRef(state.team);
  teamRef.current = state.team;

  // Initialize game on mount
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const starter = getRandomStarter(allPokemon);
      setStarterPokemon(starter);
      setGeneration(generation, allPokemon);
    }
  }, [allPokemon, generation, setGeneration]);

  const handleStarterContinue = useCallback(() => {
    if (starterPokemon) {
      setStarter(starterPokemon);
    }
  }, [starterPokemon, setStarter]);

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
            newRound();
            setRevealedPokemon(null);
            setProcessingReveal(false);
          }, 1000);
          return;
        }

        const overlap = getTypeOverlap(currentTeam, pokemon);

        if (overlap.length > 0) {
          // Type overlap — show replace dialog (works for both full and non-full teams)
          setOverlappingTypes(overlap);
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
            newRound();
            setRevealedPokemon(null);
            setProcessingReveal(false);
          }, 1200);
          return;
        }

        // Team full, no overlap, no duplicate — wasted attempt
        toast.info("Team is full! Attempt wasted.");
        setTimeout(() => {
          newRound();
          setRevealedPokemon(null);
          setProcessingReveal(false);
        }, 1000);
      }, 700);
    },
    [
      processingReveal,
      state.revealedIndex,
      state.currentCards,
      revealCard,
      addToTeam,
      newRound,
    ]
  );

  const handleReplace = useCallback(
    (teamIndex: number) => {
      if (revealedPokemon) {
        replacePokemon(teamIndex, revealedPokemon);
        setShowReplaceDialog(false);
        setRevealedPokemon(null);
        setTimeout(() => {
          newRound();
        }, 300);
      }
    },
    [revealedPokemon, replacePokemon, newRound]
  );

  const handleSkip = useCallback(() => {
    skipPokemon();
    setShowReplaceDialog(false);
    setRevealedPokemon(null);
    setTimeout(() => {
      newRound();
    }, 300);
  }, [skipPokemon, newRound]);

  const handleCloseDialog = useCallback(() => {
    // Closing the dialog is the same as skipping
    handleSkip();
  }, [handleSkip]);

  const handlePlayAgain = useCallback(() => {
    initRef.current = false;
    const starter = getRandomStarter(allPokemon);
    setStarterPokemon(starter);
    setGeneration(generation, allPokemon);
  }, [allPokemon, generation, setGeneration]);

  const handleNewGeneration = useCallback(() => {
    reset();
    router.push("/");
  }, [reset, router]);

  // Render based on phase
  if (state.phase === "picking-generation" || state.phase === "starter-reveal") {
    if (starterPokemon && state.generation) {
      return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
          <StarterReveal
            starter={starterPokemon}
            generation={state.generation}
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

  if (state.phase === "game-over" && state.generation) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
        <GameOver
          team={state.team}
          attempts={state.attempts}
          maxAttempts={state.maxAttempts}
          generation={state.generation}
          onPlayAgain={handlePlayAgain}
          onNewGeneration={handleNewGeneration}
        />
      </main>
    );
  }

  if (state.phase === "playing" && state.generation) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-8">
          <GameHeader
            generation={state.generation}
            attempts={state.attempts}
            maxAttempts={state.maxAttempts}
            teamSize={state.team.length}
            maxTeamSize={MAX_TEAM_SIZE}
          />

          <section className="text-center">
            <h3 className="mb-4 text-lg font-semibold text-zinc-300">
              Pick a card
            </h3>
            <CardGrid
              cards={state.currentCards}
              revealedIndex={state.revealedIndex}
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
