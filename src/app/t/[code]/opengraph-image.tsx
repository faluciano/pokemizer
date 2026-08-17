import { ImageResponse } from "next/og";
import { resolveShareCode } from "@/lib/share-resolve";
import { getTypeCoverage } from "@/lib/game-logic";
import { capitalize } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A shared Pokemon team on Pokemizer";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = resolveShareCode(code);

  if (!data) {
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
          }}
        >
          <div style={{ fontSize: 88, fontWeight: 700, color: "#fafafa" }}>
            Pokemizer
          </div>
          <div style={{ marginTop: 20, fontSize: 36, color: "#a1a1aa" }}>
            Build your Pokemon team with the randomizer card game
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const { gameVersion, team, attempts } = data;
  const coverage = getTypeCoverage(team);

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
            "radial-gradient(circle at 50% 0%, #1c1c1f 0%, #09090b 65%)",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, color: "#71717a" }}>
          Pokemizer
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 64,
            fontWeight: 700,
            color: "#fafafa",
          }}
        >
          {`My Pokemon ${gameVersion.displayName} Team`}
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 24,
          }}
        >
          {team.map((line) => (
            <div
              key={`${line.lineId}-${line.branchIndex ?? 0}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 156,
                  height: 156,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#18181b",
                  border: "2px solid #27272a",
                  borderRadius: 20,
                }}
              >
                <img
                  src={line.stages[0].sprite}
                  alt=""
                  width={128}
                  height={128}
                />
              </div>
              <div style={{ fontSize: 24, color: "#d4d4d8" }}>
                {capitalize(line.stages[0].name)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, fontSize: 32, color: "#a1a1aa" }}>
          {`${coverage}/18 types covered · ${attempts} attempts`}
        </div>
      </div>
    ),
    { ...size },
  );
}
