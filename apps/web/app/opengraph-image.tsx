import { ImageResponse } from "next/og";

export const alt = "Apolog — examine the claim";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#17211e",
        color: "#f7f5ef",
        display: "flex",
        flexDirection: "column",
        fontFamily: "serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 30,
          gap: "20px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#d27a35",
            borderRadius: 16,
            color: "#17211e",
            display: "flex",
            fontWeight: 800,
            height: 58,
            justifyContent: "center",
            width: 58,
          }}
        >
          A
        </div>
        Apolog
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: "#ee9d59",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Evidence before argument
        </div>
        <div
          style={{
            fontSize: 90,
            lineHeight: 0.95,
            marginTop: 22,
            maxWidth: 980,
          }}
        >
          Examine the claim.
        </div>
      </div>
      <div style={{ color: "#a8b3ad", fontFamily: "sans-serif", fontSize: 24 }}>
        Passages · Evidence · Ethics · Geography
      </div>
    </div>,
    size
  );
}
