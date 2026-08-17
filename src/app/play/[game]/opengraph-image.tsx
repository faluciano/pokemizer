import { ImageResponse } from "next/og";
import { getGameVersion, getGenerationForGame, GAME_VERSIONS } from "@/lib/games";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return GAME_VERSIONS.map((game) => ({ game: game.slug }));
}

export function generateImageMetadata({
  params,
}: {
  params: { game: string };
}) {
  const gameVersion = getGameVersion(params.game);
  return [
    {
      id: "og",
      size,
      contentType,
      alt: gameVersion
        ? `Pokemon ${gameVersion.displayName} team randomizer on Pokemizer`
        : "Pokemizer",
    },
  ];
}

function artworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  const gameVersion = getGameVersion(game);
  const generation = gameVersion ? getGenerationForGame(gameVersion) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, #18181b 0%, #09090b 60%)",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: "#71717a" }}>
          Pokemizer
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 80,
            fontWeight: 700,
            color: "#fafafa",
            textAlign: "center",
          }}
        >
          {`Pokemon ${gameVersion?.displayName ?? ""}`}
        </div>
        <div style={{ marginTop: 8, fontSize: 32, color: "#a1a1aa" }}>
          {gameVersion
            ? `${gameVersion.region} region · ${generation?.displayName ?? ""} · Team randomizer`
            : "Team randomizer card game"}
        </div>
        {gameVersion && (
          <div
            style={{
              marginTop: 48,
              display: "flex",
              gap: 48,
            }}
          >
            {gameVersion.starterIds.slice(0, 3).map((id) => (
              <img
                key={id}
                src={artworkUrl(id)}
                alt=""
                width={180}
                height={180}
              />
            ))}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
