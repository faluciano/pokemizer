import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          fontSize: 128,
          fontWeight: 700,
          color: "#e4e4e7",
        }}
      >
        P
      </div>
    ),
    { width: 192, height: 192 },
  );
}
