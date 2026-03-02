"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { toast } from "sonner";
import type { EvolutionLine, Generation, GameVersion } from "@/lib/types";
import { getRandomStarter } from "@/lib/pokemon-utils";
import {
  isDuplicate,
  getTypeCoverageDelta,
  getActionScenario,
  getReplaceableIndices,
  getTypeCoverage,
} from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { useGameState } from "@/hooks/use-game-state";
import { StarterReveal } from "@/components/starter-reveal";
import { GameHeader } from "@/components/game-header";
import { CardGrid } from "@/components/card-grid";
import { TeamDisplay } from "@/components/team-display";
import { ActionBar } from "@/components/action-bar";
import { TeamSwapSelector } from "@/components/team-swap-selector";
import { GameOver } from "@/components/game-over";

interface GameClientProps {
  generation: Generation;
  gameVersion: GameVersion;
  allPokemon: EvolutionLine[];
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

  const [revealedLine, setRevealedLine] = useState<EvolutionLine | null>(null);
  const [starterLine, setStarterLine] = useState<EvolutionLine | null>(null);
  const [processingReveal, setProcessingReveal] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [showSwapSelector, setShowSwapSelector] = useState(false);
  const [showActionBar, setShowActionBar] = useState(false);
  const [duplicateIndex, setDuplicateIndex] = useState<number | null>(null);
  const initRef = useRef(false);
  const teamRef = useRef(state.team);
  teamRef.current = state.team;

  // Initialize game on mount
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const starter = getRandomStarter(allPokemon);
      setStarterLine(starter);
      setGame(generation, gameVersion, allPokemon);
    }
  }, [allPokemon, generation, gameVersion, setGame]);

  // Track game completion
  const gameCompletedRef = useRef(false);
  useEffect(() => {
    if (state.phase === "game-over" && !gameCompletedRef.current && state.gameVersion) {
      gameCompletedRef.current = true;
      track("game_completed", {
        generation: generation.id,
        region: gameVersion.region,
        game: gameVersion.slug,
        team_size: state.team.length,
        attempts: state.attempts,
        coverage: getTypeCoverage(state.team),
      });
    }
    // Reset when starting a new game
    if (state.phase === "picking-generation") {
      gameCompletedRef.current = false;
    }
  }, [state.phase, state.gameVersion, state.team, state.attempts, generation, gameVersion]);

  const handleStarterContinue = useCallback(() => {
    haptic("light");
    if (starterLine) {
      track("game_started", {
        generation: generation.id,
        region: gameVersion.region,
        game: gameVersion.slug,
        starter: starterLine.stages[0].name,
      });
      setStarter(starterLine);
    }
  }, [starterLine, setStarter, generation, gameVersion]);

  const startNewRound = useCallback(() => {
    setRevealAll(true);
    setTimeout(() => {
      setRevealAll(false);
      newRound();
      setRevealedLine(null);
      setDuplicateIndex(null);
      setProcessingReveal(false);
      setShowActionBar(false);
      setShowSwapSelector(false);
    }, 1200);
  }, [newRound]);

  const handleReveal = useCallback(
    (index: number) => {
      haptic("medium");
      if (processingReveal || state.revealedIndex !== null) return;

      revealCard(index);
      const line = state.currentCards[index];
      setRevealedLine(line);
      setProcessingReveal(true);

      setTimeout(() => {
        const currentTeam = teamRef.current;

        // Duplicates are still auto-skipped (wasted pick)
        if (isDuplicate(currentTeam, line)) {
          haptic("error");
          setDuplicateIndex(index);
          toast.warning(
            `Duplicate! ${capitalize(line.stages[0].name)} is already on your team.`
          );
          setTimeout(() => startNewRound(), 800);
          return;
        }

        // Show action bar for all non-duplicate reveals
        setShowActionBar(true);
        setProcessingReveal(false);
      }, 500);
    },
    [processingReveal, state.revealedIndex, state.currentCards, revealCard, startNewRound]
  );

  const handleAdd = useCallback(() => {
    haptic("light");
    if (revealedLine) {
      const name = capitalize(revealedLine.stages[0].name);
      toast.success(`${name} added to your team!`);
      addToTeam(revealedLine);
      setShowActionBar(false);
      startNewRound();
    }
  }, [revealedLine, addToTeam, startNewRound]);

  const handleStartReplace = useCallback(() => {
    setShowSwapSelector(true);
    setShowActionBar(false);
  }, []);

  const handleSwapSelect = useCallback(
    (teamIndex: number) => {
      haptic("medium");
      if (revealedLine) {
        const oldName = capitalize(state.team[teamIndex].stages[0].name);
        const newName = capitalize(revealedLine.stages[0].name);
        toast.success(`Replaced ${oldName} with ${newName}!`);
        replacePokemon(teamIndex, revealedLine);
        setShowSwapSelector(false);
        startNewRound();
      }
    },
    [revealedLine, state.team, replacePokemon, startNewRound]
  );

  const handleSwapCancel = useCallback(() => {
    setShowSwapSelector(false);
    setShowActionBar(true);
  }, []);

  const handleSkip = useCallback(() => {
    haptic("light");
    skipPokemon();
    setShowActionBar(false);
    startNewRound();
  }, [skipPokemon, startNewRound]);

  const handlePlayAgain = useCallback(() => {
    initRef.current = false;
    const starter = getRandomStarter(allPokemon);
    setStarterLine(starter);
    setGame(generation, gameVersion, allPokemon);
  }, [allPokemon, generation, gameVersion, setGame]);

  const handleNewGeneration = useCallback(() => {
    reset();
    router.push("/");
  }, [reset, router]);

  // --- Render ---

  if (state.phase === "picking-generation" || state.phase === "starter-reveal") {
    if (starterLine && state.gameVersion) {
      return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
          <StarterReveal
            starter={starterLine}
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
          key={`game-over-${state.gameVersion.slug}-${state.team.length}`}
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
          <GameHeader
            gameVersion={state.gameVersion}
            teamSize={state.team.length}
            attempts={state.attempts}
            typeCoverage={getTypeCoverage(state.team)}
          />

          <section className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-semibold text-zinc-300">
              Pick a card
            </h3>
            <CardGrid
              cards={state.currentCards}
              revealedIndex={state.revealedIndex}
              revealAll={revealAll}
              duplicateIndex={duplicateIndex}
              onReveal={handleReveal}
              disabled={processingReveal || showActionBar || showSwapSelector}
            />

            {/* Action bar — shown after reveal (non-duplicate) */}
            {showActionBar && revealedLine && (
              <ActionBar
                line={revealedLine}
                scenario={getActionScenario(teamRef.current, revealedLine)}
                coverageDelta={getTypeCoverageDelta(teamRef.current, revealedLine)}
                onAdd={handleAdd}
                onReplace={handleStartReplace}
                onSkip={handleSkip}
                className="mt-2 w-full max-w-sm"
              />
            )}

            {/* Swap selector — shown when "Replace" is clicked */}
            {showSwapSelector && revealedLine && (
              <TeamSwapSelector
                team={state.team}
                replaceableIndices={getReplaceableIndices(state.team)}
                onSelect={handleSwapSelect}
                onCancel={handleSwapCancel}
                className="mt-2"
              />
            )}
          </section>

          <section>
            <h3 className="mb-4 text-center text-lg font-semibold text-zinc-300">
              Your Team ({getTypeCoverage(state.team)}/18 types)
            </h3>
            <TeamDisplay team={state.team} />
          </section>
        </div>
      </main>
    );
  }

  return null;
}
