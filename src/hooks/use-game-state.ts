"use client";

import { useCallback, useReducer } from "react";
import type { GameState, EvolutionLine, Generation, GameVersion } from "@/lib/types";
import { getRandomCards } from "@/lib/pokemon-utils";
import { isGameOver, isTeamFull } from "@/lib/game-logic";

type GameAction =
  | { type: "SET_GAME"; generation: Generation; gameVersion: GameVersion; allPokemon: EvolutionLine[] }
  | { type: "SET_STARTER"; line: EvolutionLine }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "ADD_TO_TEAM"; line: EvolutionLine }
  | { type: "REPLACE_POKEMON"; teamIndex: number; newLine: EvolutionLine }
  | { type: "SKIP_POKEMON" }
  | { type: "NEW_ROUND" }
  | { type: "RESET" };

const initialState: GameState = {
  phase: "picking-generation",
  generation: null,
  gameVersion: null,
  team: [],
  attempts: 0,
  currentCards: [],
  revealedIndex: null,
  allPokemon: [],
  excludedLineIds: [],
};

function dealCards(state: GameState): { cards: EvolutionLine[]; poolExhausted: boolean } {
  const cards = getRandomCards(
    state.allPokemon,
    state.team,
    3,
    new Set(state.excludedLineIds)
  );
  return { cards, poolExhausted: cards.length === 0 };
}

function checkGameOver(state: GameState, poolExhausted: boolean = false): GameState {
  if (isGameOver(state.team, poolExhausted)) {
    return { ...state, phase: "game-over" };
  }
  return state;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_GAME": {
      return {
        ...state,
        phase: "starter-reveal",
        generation: action.generation,
        gameVersion: action.gameVersion,
        allPokemon: action.allPokemon,
        team: [],
        attempts: 0,
        currentCards: [],
        revealedIndex: null,
        excludedLineIds: [],
      };
    }

    case "SET_STARTER": {
      const team = [action.line];
      // Exclude other starters by lineId
      const otherStarterLineIds = state.allPokemon
        .filter((l) => l.isStarter && l.lineId !== action.line.lineId)
        .map((l) => l.lineId);
      const excludedLineIds = [...new Set(otherStarterLineIds)];
      const tempState: GameState = { ...state, team, excludedLineIds };
      const cards = getRandomCards(state.allPokemon, team, 3, new Set(excludedLineIds));

      // Check for pool exhaustion right away
      if (cards.length === 0) {
        return { ...tempState, phase: "game-over", currentCards: [], revealedIndex: null };
      }

      return {
        ...tempState,
        phase: "playing",
        currentCards: cards,
        revealedIndex: null,
      };
    }

    case "REVEAL_CARD": {
      return {
        ...state,
        revealedIndex: action.index,
        attempts: state.attempts + 1,
      };
    }

    case "ADD_TO_TEAM": {
      const team = [...state.team, action.line];
      const newState: GameState = { ...state, team };
      return checkGameOver(newState);
    }

    case "REPLACE_POKEMON": {
      const oldLine = state.team[action.teamIndex];
      const team = [...state.team];
      team[action.teamIndex] = action.newLine;
      // Replaced pokemon's lineId goes to excluded (it's "released")
      const excludedLineIds = [...state.excludedLineIds, oldLine.lineId];
      const newState: GameState = { ...state, team, excludedLineIds };
      return checkGameOver(newState);
    }

    case "SKIP_POKEMON": {
      // Skipped pokemon stays in pool — just move on
      // This is now meaningful: it transitions the UI to deal new cards
      return state;
    }

    case "NEW_ROUND": {
      if (state.phase === "game-over") return state;
      const { cards, poolExhausted } = dealCards(state);
      if (poolExhausted) {
        return { ...state, phase: "game-over", currentCards: [], revealedIndex: null };
      }
      return { ...state, currentCards: cards, revealedIndex: null };
    }

    case "RESET": {
      return initialState;
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setGame = useCallback(
    (generation: Generation, gameVersion: GameVersion, allPokemon: EvolutionLine[]) => {
      dispatch({ type: "SET_GAME", generation, gameVersion, allPokemon });
    },
    []
  );

  const setStarter = useCallback((line: EvolutionLine) => {
    dispatch({ type: "SET_STARTER", line });
  }, []);

  const revealCard = useCallback((index: number) => {
    dispatch({ type: "REVEAL_CARD", index });
  }, []);

  const addToTeam = useCallback((line: EvolutionLine) => {
    dispatch({ type: "ADD_TO_TEAM", line });
  }, []);

  const replacePokemon = useCallback(
    (teamIndex: number, newLine: EvolutionLine) => {
      dispatch({ type: "REPLACE_POKEMON", teamIndex, newLine });
    },
    []
  );

  const skipPokemon = useCallback(() => {
    dispatch({ type: "SKIP_POKEMON" });
  }, []);

  const newRound = useCallback(() => {
    dispatch({ type: "NEW_ROUND" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    setGame,
    setStarter,
    revealCard,
    addToTeam,
    replacePokemon,
    skipPokemon,
    newRound,
    reset,
  };
}
