import type { MetadataRoute } from "next";
import { GAME_VERSIONS } from "@/lib/games";

export default function sitemap(): MetadataRoute.Sitemap {
  const gamePages = GAME_VERSIONS.map((game) => ({
    url: `https://pokemizer.com/play/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://pokemizer.com",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: "https://pokemizer.com/history",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    ...gamePages,
  ];
}
