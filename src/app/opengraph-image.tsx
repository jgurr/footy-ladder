import { ImageResponse } from "next/og";

export const alt = "Footy Ladder - The ladder that actually makes sense";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0b0b09",
          color: "#f5f1df",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 64,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(229, 180, 89, 0.55)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            height: "100%",
            justifyContent: "space-between",
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#e5b459", fontSize: 30, letterSpacing: 3 }}>
              NRL WIN %
            </div>
            <div style={{ color: "#8be28b", fontSize: 30 }}>TOP 8 CUT</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 96, fontWeight: 800 }}>Footy Ladder</div>
            <div style={{ color: "#d6cfb4", fontSize: 42 }}>
              The ladder that actually makes sense.
            </div>
          </div>

          <div
            style={{
              color: "#9f9b87",
              display: "flex",
              fontSize: 30,
              gap: 28,
            }}
          >
            <span>Win percentage first</span>
            <span>•</span>
            <span>No bye distortion</span>
            <span>•</span>
            <span>Finals race view</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
