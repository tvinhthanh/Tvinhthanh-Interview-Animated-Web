import { ImageResponse } from "next/og";

export const alt = "Sark SEO strategy for sustainable growth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f2efe7",
          color: "#202126",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
          <div style={{ alignItems: "center", display: "flex", fontSize: 34, fontWeight: 800, marginBottom: 64 }}>
            <span style={{ color: "#43eb72", marginRight: 14 }}>▶</span>
            Sark
          </div>
          <div style={{ fontFamily: "serif", fontSize: 80, fontWeight: 600, lineHeight: 1.08 }}>
            SEO strategy for sustainable growth
          </div>
          <div style={{ color: "#5f646c", fontSize: 26, lineHeight: 1.5, marginTop: 32 }}>
            Technical foundations, useful content, measurable outcomes.
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#43eb72",
            borderRadius: 180,
            display: "flex",
            fontSize: 88,
            height: 360,
            justifyContent: "center",
            width: 280,
          }}
        >
          ↑
        </div>
      </div>
    ),
    size,
  );
}
