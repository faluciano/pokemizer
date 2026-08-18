import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-950/80 px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <LogoMark className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-white">
            Pokemizer
          </span>
        </Link>
      </div>
    </header>
  );
}
