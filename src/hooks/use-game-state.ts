"use client";

import { useCallback, useReducer } from "react";
import type { GameState, Pokemon, Generation, GameVersion } from "@/lib/types";
import { getRandomCards } from "@/lib/pokemon-utils";
import { isGameOver } from "@/lib/game-logic";

type GameAction =
  | { type: "SET_GAME"; generation: Generation; gameVersion: GameVersion; allPokemon: Pokemon[] }
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
  gameVersion: null,
  team: [],
  attempts: 0,
  currentCards: [],
  revealedIndex: null,
  allPokemon: [],
  excludedIds: [],
};

function checkGameOver(state: GameState): GameState {
  if (isGameOver(state.team)) {
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
        excludedIds: [],
      };
    }

    case "SET_STARTER": {
      const team = [action.pokemon];
      const otherStarterIds = state.allPokemon
        .filter((p) => p.isStarter && p.id !== action.pokemon.id)
        .map((p) => p.id);
      const excludedIds = otherStarterIds;
      const currentCards = getRandomCards(state.allPokemon, team, 3, new Set(excludedIds));
      return {
        ...state,
        phase: "playing",
        team,
        currentCards,
        revealedIndex: null,
        excludedIds,
      };
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
      const oldPokemon = state.team[action.teamIndex];
      const team = [...state.team];
      team[action.teamIndex] = action.newPokemon;
      const excludedIds = [...state.excludedIds, oldPokemon.id];
      const newState: GameState = { ...state, team, excludedIds };
      return checkGameOver(newState);
    }

    case "SKIP_POKEMON": {
      return state;
    }

    case "NEW_ROUND": {
      if (state.phase === "game-over") return state;
      const currentCards = getRandomCards(
        state.allPokemon,
        state.team,
        3,
        new Set(state.excludedIds)
      );
      return { ...state, currentCards, revealedIndex: null };
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
    (generation: Generation, gameVersion: GameVersion, allPokemon: Pokemon[]) => {
      dispatch({ type: "SET_GAME", generation, gameVersion, allPokemon });
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
