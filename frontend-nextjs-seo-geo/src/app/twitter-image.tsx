import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "FinTrack — Next.js SEO/GEO";
export const size = {
  width: 1200,
  height: 600
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, rgba(79,124,255,.45), rgba(34,197,94,.35)), #0b1220",
          color: "#e6eefc",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 850, lineHeight: 1.05 }}>FinTrack — SEO/GEO</div>
        <div style={{ marginTop: 14, fontSize: 26, opacity: 0.85 }}>Next.js App Router landing pages</div>
      </div>
    ),
    size
  );
}

