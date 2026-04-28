import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "FinTrack — Next.js SEO/GEO";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background:
            "radial-gradient(900px 500px at 20% 20%, rgba(79,124,255,.55), transparent), radial-gradient(700px 420px at 80% 10%, rgba(34,197,94,.45), transparent), #0b1220",
          color: "#e6eefc",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#4f7cff",
              boxShadow: "0 0 0 6px rgba(79,124,255,.25)"
            }}
          />
          <div style={{ fontSize: 24, opacity: 0.9 }}>FinTrack</div>
        </div>

        <div style={{ marginTop: 24, fontSize: 64, lineHeight: 1.05, fontWeight: 800 }}>
          Next.js Landing Page
          <br />
          tối ưu SEO + GEO
        </div>

        <div style={{ marginTop: 18, fontSize: 26, opacity: 0.8 }}>
          Metadata • Sitemap/Robots • JSON-LD • Pages theo địa điểm
        </div>
      </div>
    ),
    size
  );
}

