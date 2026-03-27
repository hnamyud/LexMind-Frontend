import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig, Audio } from "remotion";

const MOCK_TEXTS = [
  "Nghị định 100/2019/NĐ-CP", "Điều 5 Khoản 1 Điểm a", "Luật Giao thông đường bộ 2008",
  "Phạt tiền từ 2.000.000 đồng đến 3.000.000 đồng", "Tước quyền sử dụng Giấy phép lái xe",
  "Nghị định 123/2021/NĐ-CP", "Điểm c Khoản 4 Điều 18", "Đảm bảo trật tự an toàn giao thông",
  "Vi phạm hành chính", "Tạm giữ phương tiện", "Luật Xử lý vi phạm hành chính",
  "Quyết định xử phạt", "Điều 6 Khoản 2 Điểm b", "Nghị định 168/2024/NĐ-CP"
];

export const Slide1Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in text from 0 to 30
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12 } });

  // Blur out at the end from 270 to 300
  const containerOpacity = interpolate(frame, [270, 300], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", opacity: containerOpacity }}>
      <Audio src="/presentation/audio/slide_1.mp3" />
      {/* Messy Background Texts */}
      {MOCK_TEXTS.map((text, i) => {
        const xOptions = [10, 70, 20, 80, 5, 85, 30, 60, 15, 75, 25, 65, 40, 50];
        const yOptions = [10, 15, 30, 20, 50, 40, 70, 65, 85, 80, 95, 25, 45, 60];

        // Appear one by one
        const appearFrame = i * 2;
        const textOpacity = interpolate(
          frame,
          [appearFrame, appearFrame + 10],
          [0, 0.4 - (i % 3) * 0.1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${xOptions[i]}%`,
              top: `${yOptions[i]}%`,
              color: "#475569",
              fontSize: "24px",
              fontFamily: "monospace",
              opacity: textOpacity,
              filter: `blur(${Math.max(1, (i % 3) * 2)}px)`,
              transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i * 2)}deg)`,
            }}
          >
            {text}
          </div>
        );
      })}

      {/* Main Title */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <h1
          style={{
            fontSize: "80px",
            color: "#f1f5f9",
            fontWeight: "bold",
            textAlign: "center",
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          Luật pháp rất phức tạp...
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
