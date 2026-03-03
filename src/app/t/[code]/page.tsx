import type { Metadata } from "next";
import Link from "next/link";
import { resolveShareCode } from "@/lib/share";
import { getTypeCoverage } from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";
import { SharedTeamView } from "@/components/shared-team-view";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const data = resolveShareCode(code);

  if (!data) {
    return {
      title: "Shared Team — Pokemizer",
      description: "View a shared Pokemon team on Pokemizer.",
    };
  }

  const { gameVersion, team, attempts } = data;
  const coverage = getTypeCoverage(team);
  const pokemonNames = team
    .map((l) => capitalize(l.stages[0].name))
    .join(", ");

  return {
    title: `${gameVersion.displayName} Team — Pokemizer`,
    description: `${pokemonNames} — ${coverage}/18 types · ${attempts} attempts`,
    openGraph: {
      title: `My ${gameVersion.displayName} Team — Pokemizer`,
      description: `${pokemonNames}\n${coverage}/18 types covered · ${attempts} attempts used`,
      url: `https://pokemizer.com/t/${code}`,
      siteName: "Pokemizer",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `My ${gameVersion.displayName} Team — Pokemizer`,
      description: `${pokemonNames} — ${coverage}/18 types`,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { code } = await params;
  const data = resolveShareCode(code);

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            Invalid Team Link
          </h2>
          <p className="max-w-sm text-sm text-zinc-400">
            This link seems broken. It may have been copied incorrectly or the
            team data could not be found.
          </p>
          <Link href="/">
            <Button>Go to Pokemizer</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
      <SharedTeamView
        gameVersion={data.gameVersion}
        generation={data.generation}
        team={data.team}
        attempts={data.attempts}
      />
    </main>
  );
}
