import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, displayFont, sceneStyle, slideUp, surfaceStyle } from "./theme";

const bullets = [
  ["Hành vi", "Xe máy không chấp hành hiệu lệnh đèn tín hiệu giao thông."],
  ["Mức phạt", "4.000.000 đến 6.000.000 đồng."],
  ["Bổ sung", "Có thể bị trừ 04 điểm trên giấy phép lái xe."],
];

const citations = ["Điều 7 · NĐ 168/2024", "Khoản 13 · Điểm c", "Điểm b · Khoản 10"];

export const Slide4Result: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame, fps, config: { damping: 16, mass: 0.72 } });
  const scale = interpolate(card, [0, 1], [0.96, 1], { extrapolateRight: "clamp" });
  const y = interpolate(card, [0, 1], [36, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ ...sceneStyle, padding: 76, justifyContent: "center", alignItems: "center" }}>
      <Audio src="/presentation/audio/slide_4.mp3" />

      <div
        style={{
          ...surfaceStyle,
          width: 1320,
          borderRadius: 46,
          padding: 44,
          transform: `translateY(${y}px) scale(${scale})`,
          opacity: card,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 28, borderBottom: `1px solid ${colors.outline}` }}>
          <div style={{ width: 68, height: 68, borderRadius: 24, background: colors.primaryContainer, color: colors.primary, display: "grid", placeItems: "center", fontSize: 36, fontWeight: 900 }}>
            L
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: displayFont }}>LexMind trả lời</div>
            <div style={{ marginTop: 6, fontSize: 20, color: colors.faint }}>Nguồn luật rõ, có thể click để mở điều khoản gốc</div>
          </div>
          <div style={{ marginLeft: "auto", borderRadius: 999, padding: "12px 18px", background: colors.primaryContainer, color: colors.onPrimaryContainer, fontSize: 18, fontWeight: 760 }}>
            Citation-first
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.78fr", gap: 32, marginTop: 34 }}>
          <div style={{ display: "grid", gap: 22 }}>
            {bullets.map(([label, value], index) => (
              <div
                key={label}
                style={{
                  ...slideUp(frame, 28 + index * 34),
                  borderRadius: 30,
                  padding: "24px 28px",
                  background: index === 1 ? colors.primaryContainer : colors.surfaceHigh,
                  border: `1px solid ${index === 1 ? colors.primaryBright : colors.outline}`,
                }}
              >
                <div style={{ color: index === 1 ? colors.primary : colors.muted, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
                  {label}
                </div>
                <div style={{ marginTop: 10, color: colors.text, fontSize: index === 1 ? 38 : 28, lineHeight: 1.35, fontWeight: index === 1 ? 820 : 650, fontFamily: index === 1 ? displayFont : undefined }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ ...slideUp(frame, 130), borderRadius: 30, background: colors.tertiaryContainer, padding: "26px 28px", border: `1px solid ${colors.tertiary}` }}>
              <div style={{ color: colors.tertiary, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 820 }}>
                Nguồn tham chiếu
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
                {citations.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      ...slideUp(frame, 146 + index * 12, 12),
                      borderRadius: 999,
                      padding: "12px 18px",
                      background: "rgba(255,255,255,0.68)",
                      border: `1px solid ${colors.tertiary}`,
                      color: colors.tertiary,
                      fontSize: 18,
                      fontWeight: 760,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...slideUp(frame, 204), borderRadius: 30, padding: "26px 28px", background: colors.errorContainer, border: `1px solid ${colors.error}` }}>
              <div style={{ color: colors.error, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 820 }}>Lưu ý</div>
              <div style={{ marginTop: 12, color: colors.text, fontSize: 24, lineHeight: 1.45 }}>
                Nếu hành vi gây tai nạn, mức phạt có thể tăng theo tình tiết và căn cứ áp dụng.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
