import React from "react";
import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";
import { colors, displayFont, sceneStyle, slideUp, surfaceStyle } from "./theme";

const docs = [
  { title: "Nghị định 168/2024/NĐ-CP", meta: "Điều 7 · Khoản 13 · Điểm c" },
  { title: "Luật xử lý vi phạm hành chính", meta: "Thẩm quyền · trình tự · hiệu lực" },
  { title: "Luật giao thông đường bộ", meta: "Quy tắc · phương tiện · trách nhiệm" },
];

export const Slide1Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ ...sceneStyle, opacity: out, padding: 96 }}>
      <Audio src="/presentation/audio/slide_1.mp3" />

      <div style={{ ...slideUp(frame, 8), display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, borderRadius: 99, background: colors.error }} />
        <div style={{ color: colors.error, fontWeight: 800, fontSize: 24 }}>Vấn đề</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 72, alignItems: "center", height: "100%" }}>
        <div>
          <h1
            style={{
              ...slideUp(frame, 18, 36),
              fontSize: 92,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: 900,
              fontWeight: 780,
              fontFamily: displayFont,
            }}
          >
            Văn bản luật nhiều tầng, câu trả lời dễ mất căn cứ.
          </h1>
          <p
            style={{
              ...slideUp(frame, 42),
              marginTop: 32,
              fontSize: 34,
              lineHeight: 1.5,
              color: colors.muted,
              maxWidth: 820,
            }}
          >
            Người dùng cần tra cứu nhanh, nhưng vẫn phải thấy điều, khoản và tình huống pháp lý liên quan.
          </p>
        </div>

        <div style={{ position: "relative", height: 690 }}>
          {docs.map((doc, index) => {
            const p = slideUp(frame, 40 + index * 18, 30);
            return (
              <div
                key={doc.title}
                style={{
                  ...surfaceStyle,
                  ...p,
                  position: "absolute",
                  left: index * 46,
                  top: 80 + index * 142,
                  width: 690,
                  borderRadius: 34,
                  padding: "34px 38px",
                  transform: `${p.transform} rotate(${index === 1 ? "-2deg" : index === 2 ? "2deg" : "0deg"})`,
                }}
              >
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                  <div style={{ width: 58, height: 58, borderRadius: 18, background: colors.errorContainer, color: colors.error, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>
                    §
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 760 }}>{doc.title}</div>
                    <div style={{ marginTop: 8, color: colors.faint, fontSize: 20 }}>{doc.meta}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            style={{
              ...surfaceStyle,
              ...slideUp(frame, 112),
              position: "absolute",
              right: 20,
              bottom: 40,
              borderRadius: 999,
              padding: "18px 30px",
              color: colors.error,
              fontSize: 24,
              fontWeight: 760,
            }}
          >
            Tra cứu thủ công mất thời gian
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
