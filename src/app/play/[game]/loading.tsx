import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header skeleton */}
        <Skeleton className="h-14 w-full rounded-lg" />

        {/* Cards section */}
        <section className="text-center">
          <p className="mb-4 text-lg font-semibold text-zinc-400">
            Loading Pokemon...
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[240px] w-[170px] rounded-xl"
              />
            ))}
          </div>
        </section>

        {/* Team section */}
        <section>
          <Skeleton className="mx-auto mb-4 h-6 w-32" />
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[120px] w-[110px] rounded-lg"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
