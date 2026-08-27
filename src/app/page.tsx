import type { Metadata } from "next";
import Link from "next/link";
import { GenerationPicker } from "@/components/generation-picker";
import { HowToPlay } from "@/components/how-to-play";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://pokemizer.com",
  },
};

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3">
          <LogoMark className="h-12 w-12" />
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Pokemizer
          </h1>
        </div>
        <p className="mt-3 text-lg text-zinc-400">
          Build your Pokemon team with the randomizer card game
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <HowToPlay />
          <a
            href="https://ko-fi.com/faluciano"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#FF5E5B] px-3 text-sm font-medium text-white transition-colors hover:bg-[#ff4744]"
          >
            <span aria-hidden="true">☕</span>
            Support on Ko-fi
          </a>
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
