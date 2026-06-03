import React from "react";
import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";
import { colors, font, sceneStyle, slideUp, surfaceStyle } from "./theme";

const QUESTION = "Xe máy vượt đèn đỏ bị phạt thế nào?";

const graphNodes = [
  { label: "Hành vi", x: 250, y: 390, color: colors.secondary, frame: 54 },
  { label: "Vượt đèn đỏ", x: 540, y: 210, color: colors.primary, frame: 70 },
  { label: "Xe máy", x: 820, y: 500, color: colors.secondary, frame: 86 },
  { label: "Mức phạt", x: 1120, y: 260, color: colors.success, frame: 104 },
  { label: "Trừ điểm", x: 1430, y: 560, color: colors.tertiary, frame: 124 },
];

export const Slide3Action: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Math.floor(interpolate(frame, [22, 112], [0, QUESTION.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const visibleText = QUESTION.slice(0, chars);

  return (
    <AbsoluteFill style={{ ...sceneStyle, padding: 86 }}>
      <Audio src="/presentation/audio/slide_3.mp3" />

      <div style={{ ...slideUp(frame, 8), color: colors.primary, fontSize: 24, fontWeight: 800 }}>
        Demo luồng tra cứu
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 60, height: "100%", alignItems: "center" }}>
        <div style={{ ...slideUp(frame, 18) }}>
          <h1 style={{ margin: 0, fontSize: 82, lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 800 }}>
            Nhập tình huống tự nhiên.
          </h1>
          <p style={{ marginTop: 24, fontSize: 30, lineHeight: 1.45, color: colors.muted }}>
            LexMind tự nhận diện hành vi, phương tiện, mức phạt và căn cứ điều khoản liên quan.
          </p>

          <div
            style={{
              ...surfaceStyle,
              marginTop: 46,
              borderRadius: 999,
              padding: "28px 34px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              minHeight: 94,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 99, display: "grid", placeItems: "center", background: colors.primaryContainer, color: colors.primary, fontSize: 30 }}>+</div>
            <div style={{ fontSize: 30, color: colors.text, flex: 1 }}>
              {visibleText}
              {chars < QUESTION.length && <span style={{ display: "inline-block", width: 4, height: 34, marginLeft: 8, background: colors.primary }} />}
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 99, background: colors.primary, color: "#fff", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 900 }}>
              ↑
            </div>
          </div>
        </div>

        <div style={{ ...surfaceStyle, ...slideUp(frame, 46), height: 690, borderRadius: 42, padding: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 28, left: 32, zIndex: 5, display: "flex", gap: 10 }}>
            {[
              ["Điều khoản", colors.tertiary],
              ["Mức phạt", colors.success],
              ["Vi phạm", colors.secondary],
            ].map(([label, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 12px", background: colors.surfaceHigh, color: colors.muted, fontSize: 16 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: color }} />
                {label}
              </div>
            ))}
          </div>

          <svg width="100%" height="100%" viewBox="0 0 1600 700">
            {graphNodes.map((node, index) => {
              if (index === 0) return null;
              const prev = graphNodes[index - 1];
              const p = interpolate(frame, [node.frame - 8, node.frame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <line key={`edge-${node.label}`} x1={prev.x} y1={prev.y} x2={node.x} y2={node.y} stroke={colors.primaryBright} strokeWidth={5} opacity={p * 0.32} />;
            })}

            {graphNodes.map((node) => {
              const p = interpolate(frame, [node.frame, node.frame + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <g key={node.label} transform={`translate(${node.x}, ${node.y}) scale(${p})`} opacity={p}>
                  <circle r={70} fill={node.color} opacity={0.16} />
                  <circle r={46} fill={node.color} />
                  <text y={90} textAnchor="middle" fill={colors.text} fontFamily={font} fontSize={30} fontWeight={760}>
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
