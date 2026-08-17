import Link from "next/link";
import { GENERATIONS } from "@/lib/starters";
import { getGamesByGeneration } from "@/lib/games";
import { capitalize } from "@/lib/utils";
import type { EvolutionLine, GameVersion, Generation } from "@/lib/types";

interface SeoContentProps {
  gameVersion: GameVersion;
  generation: Generation;
  allPokemon: EvolutionLine[];
}

export function GameSeoContent({
  gameVersion,
  generation,
  allPokemon,
}: SeoContentProps) {
  const starterNames = allPokemon
    .filter((line) => gameVersion.starterIds.includes(line.stages[0].id))
    .map((line) => capitalize(line.stages[0].name));

  const siblingGames = getGamesByGeneration(gameVersion.generationId).filter(
    (g) => g.slug !== gameVersion.slug,
  );

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-8">
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-semibold text-zinc-200">
          Pokemon {gameVersion.displayName} Team Randomizer
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-400">
          <p>
            Pokemizer builds a random Pokemon team for Pokemon{" "}
            {gameVersion.displayName} as a card game. The pool covers{" "}
            {allPokemon.length} evolution lines from the {gameVersion.region}{" "}
            regional Pokedex ({generation.displayName}), matching what you can
            actually catch in {gameVersion.displayName}
            {gameVersion.excludedSpeciesIds?.length
              ? ", with version-exclusive Pokemon filtered out"
              : ""}
            .
          </p>
          <p>
            You start with a random starter
            {starterNames.length > 0 && (
              <> — {starterNames.join(", ")} in this game</>
            )}
            . From there, flip cards to reveal random Pokemon and decide whether
            to add, skip, or swap each one. Every flip counts as an attempt, and
            overlapping types hurt your coverage score — the goal is a team of
            six covering as many of the 18 types as possible in as few attempts
            as you can. Use it to plan a fresh playthrough, a Nuzlocke run, or a
            randomized challenge with friends.
          </p>
        </div>

        {siblingGames.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-300">
              Other {generation.displayName} games
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {siblingGames.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/play/${g.slug}`}
                    className="text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
                  >
                    Pokemon {g.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-300">
            All games on Pokemizer
          </h3>
          <div className="mt-3 space-y-2">
            {GENERATIONS.map((gen) => {
              const games = getGamesByGeneration(gen.id);
              if (games.length === 0) return null;
              return (
                <p key={gen.id} className="text-xs leading-relaxed text-zinc-500">
                  <span className="text-zinc-400">
                    {gen.displayName} ({gen.region}):
                  </span>{" "}
                  {games.map((g, i) => (
                    <span key={g.slug}>
                      {i > 0 && " · "}
                      <Link
                        href={`/play/${g.slug}`}
                        className="underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
                      >
                        {g.displayName}
                      </Link>
                    </span>
                  ))}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
