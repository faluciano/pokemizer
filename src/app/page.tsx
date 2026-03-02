import Link from "next/link";
import { GenerationPicker } from "@/components/generation-picker";
import { HowToPlay } from "@/components/how-to-play";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Pokemizer
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Build your Pokemon team with the randomizer card game
        </p>
        <div className="mt-4">
          <HowToPlay />
        </div>
      </div>

      <section>
        <h2 className="mb-6 text-center text-xl font-semibold text-zinc-300">
          Choose a Generation
        </h2>
        <GenerationPicker />
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/history"
          className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline transition-colors"
        >
          View Team History →
        </Link>
      </div>
    </main>
  );
}
