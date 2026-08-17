import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pokemizer — Pokemon team randomizer card game";

export default function OpengraphImage() {
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
            "radial-gradient(circle at 25% 25%, #18181b 0%, #09090b 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#18181b",
              border: "2px solid #3f3f46",
              borderRadius: 24,
              fontSize: 64,
              fontWeight: 700,
              color: "#e4e4e7",
            }}
          >
            P
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, color: "#fafafa" }}>
            Pokemizer
          </div>
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 36,
            color: "#a1a1aa",
            textAlign: "center",
          }}
        >
          Build your Pokemon team with the randomizer card game
        </div>
      </div>
    ),
    { ...size },
  );
}
