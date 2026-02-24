"use client";

import { useCallback, useReducer } from "react";
import type { GameState, Pokemon, Generation } from "@/lib/types";
import { getRandomCards, getRandomStarter } from "@/lib/pokeapi";
import {
  getTypeOverlap,
  canAutoAdd,
  isDuplicate,
  isGameOver,
  isTeamFull,
  MAX_ATTEMPTS,
  MAX_TEAM_SIZE,
} from "@/lib/game-logic";

type GameAction =
  | { type: "SET_GENERATION"; generation: Generation; allPokemon: Pokemon[] }
  | { type: "SET_STARTER"; pokemon: Pokemon }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "ADD_TO_TEAM"; pokemon: Pokemon }
  | { type: "REPLACE_POKEMON"; teamIndex: number; newPokemon: Pokemon }
  | { type: "SKIP_POKEMON" }
  | { type: "NEW_ROUND" }
  | { type: "RESET" };

const initialState: GameState = {
  phase: "picking-generation",
  generation: null,
  team: [],
  attempts: 0,
  maxAttempts: MAX_ATTEMPTS,
  currentCards: [],
  revealedIndex: null,
  allPokemon: [],
};

function checkGameOver(state: GameState): GameState {
  if (isGameOver(state.team, state.attempts)) {
    return { ...state, phase: "game-over" };
  }
  return state;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_GENERATION": {
      return {
        ...state,
        phase: "starter-reveal",
        generation: action.generation,
        allPokemon: action.allPokemon,
        team: [],
        attempts: 0,
        currentCards: [],
        revealedIndex: null,
      };
    }

    case "SET_STARTER": {
      const team = [action.pokemon];
      const currentCards = getRandomCards(state.allPokemon, team);
      const newState: GameState = {
        ...state,
        phase: "playing",
        team,
        currentCards,
        revealedIndex: null,
      };
      return newState;
    }

    case "REVEAL_CARD": {
      const newAttempts = state.attempts + 1;
      return {
        ...state,
        revealedIndex: action.index,
        attempts: newAttempts,
      };
    }

    case "ADD_TO_TEAM": {
      const team = [...state.team, action.pokemon];
      const newState: GameState = {
        ...state,
        team,
      };
      return checkGameOver(newState);
    }

    case "REPLACE_POKEMON": {
      const team = [...state.team];
      team[action.teamIndex] = action.newPokemon;
      const newState: GameState = {
        ...state,
        team,
      };
      return checkGameOver(newState);
    }

    case "SKIP_POKEMON": {
      return checkGameOver(state);
    }

    case "NEW_ROUND": {
      const currentCards = getRandomCards(state.allPokemon, state.team);
      return {
        ...state,
        currentCards,
        revealedIndex: null,
      };
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

  const setGeneration = useCallback(
    (generation: Generation, allPokemon: Pokemon[]) => {
      dispatch({ type: "SET_GENERATION", generation, allPokemon });
    },
    []
  );

  const setStarter = useCallback((pokemon: Pokemon) => {
    dispatch({ type: "SET_STARTER", pokemon });
  }, []);

  const revealCard = useCallback((index: number) => {
    dispatch({ type: "REVEAL_CARD", index });
  }, []);

  const addToTeam = useCallback((pokemon: Pokemon) => {
    dispatch({ type: "ADD_TO_TEAM", pokemon });
  }, []);

  const replacePokemon = useCallback(
    (teamIndex: number, newPokemon: Pokemon) => {
      dispatch({ type: "REPLACE_POKEMON", teamIndex, newPokemon });
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
    setGeneration,
    setStarter,
    revealCard,
    addToTeam,
    replacePokemon,
    skipPokemon,
    newRound,
    reset,
  };
}
