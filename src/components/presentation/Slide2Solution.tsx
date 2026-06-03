import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, sceneStyle, slideUp, surfaceStyle } from "./theme";

const features = [
  ["Citation-first", "Nguồn luật luôn nằm trong luồng trả lời"],
  ["Graph-backed", "Quan hệ điều khoản được truy vết rõ"],
  ["Ops-ready", "Admin review nhanh, sáng và dễ scan"],
];

export const Slide2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 16, mass: 0.75 } });
  const sweep = interpolate(frame, [28, 80], [-500, 2100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ ...sceneStyle, padding: 96 }}>
      <Audio src="/presentation/audio/slide_2.mp3" />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: sweep,
          width: 220,
          transform: "skewX(-14deg)",
          background: "linear-gradient(90deg, transparent, rgba(36,183,201,0.28), transparent)",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 70, height: "100%", alignItems: "center" }}>
        <div style={{ ...slideUp(frame, 18) }}>
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 36,
              background: colors.primaryContainer,
              color: colors.primary,
              display: "grid",
              placeItems: "center",
              fontSize: 64,
              fontWeight: 900,
              transform: `scale(${logoScale})`,
              boxShadow: "0 22px 60px rgba(15,108,122,0.18)",
            }}
          >
            L
          </div>
          <h1 style={{ margin: "30px 0 0", fontSize: 96, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 820 }}>
            LexMind
          </h1>
          <p style={{ marginTop: 24, color: colors.muted, fontSize: 34, lineHeight: 1.45, maxWidth: 700 }}>
            Một workspace pháp lý theo Material 3: nhẹ, sáng, có căn cứ và sẵn sàng demo bằng video.
          </p>
        </div>

        <div style={{ ...surfaceStyle, ...slideUp(frame, 56), borderRadius: 44, padding: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 26, borderBottom: `1px solid ${colors.outline}` }}>
            <div style={{ width: 62, height: 62, borderRadius: 22, background: colors.primaryContainer, color: colors.primary, display: "grid", placeItems: "center", fontSize: 34 }}>
              ✦
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 760 }}>LexMind chat shell</div>
              <div style={{ marginTop: 6, color: colors.faint, fontSize: 20 }}>Material 3 surfaces · legal citation chips</div>
            </div>
            <div style={{ marginLeft: "auto", borderRadius: 999, padding: "10px 18px", background: colors.surfaceHigh, color: colors.primary, fontSize: 18, fontWeight: 700 }}>
              Pháp lý
            </div>
          </div>

          <div style={{ display: "grid", gap: 22, marginTop: 32 }}>
            {features.map(([title, copy], index) => (
              <div
                key={title}
                style={{
                  ...slideUp(frame, 82 + index * 16),
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  borderRadius: 28,
                  padding: "24px 26px",
                  background: index === 0 ? colors.primaryContainer : colors.surfaceHigh,
                  border: `1px solid ${colors.outline}`,
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 99, background: index === 0 ? colors.primary : colors.secondary, color: "#fff", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 900 }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: 25, fontWeight: 780 }}>{title}</div>
                  <div style={{ color: colors.muted, fontSize: 20, marginTop: 5 }}>{copy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
