import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Audio } from "remotion";

const QUESTION = "Mức phạt vượt đèn đỏ đối với xe máy là gì?";

export const Slide3Action: React.FC = () => {
  const frame = useCurrentFrame();

  // Typing effect
  const charsToShow = Math.floor(interpolate(frame, [20, 120], [0, QUESTION.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const visibleText = QUESTION.substring(0, charsToShow);

  const graphNodes = [
    { id: 1, label: "Người điều khiển", x: 250, y: 350, popFrame: 40 },
    { id: 2, label: "Vượt đèn đỏ", x: 500, y: 150, popFrame: 50 },
    { id: 3, label: "Xe máy", x: 750, y: 550, popFrame: 70 },
    { id: 4, label: "Phạt tiền", x: 1050, y: 250, popFrame: 80 },
    { id: 5, label: "Trừ 4 điểm", x: 1350, y: 600, popFrame: 100 },
    { id: 6, label: "Gây tai nạn", x: 1650, y: 350, popFrame: 130 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", padding: "80px" }}>
      <Audio src="/presentation/audio/slide_3.mp3" />
      {/* 
        This div simulates the chat input or question bubble 
      */}
      <div
        style={{
          width: "100%", maxWidth: "1200px", margin: "0 auto",
          padding: "40px",
          backgroundColor: "rgba(0, 242, 255, 0.05)",
          border: "2px solid rgba(0, 242, 255, 0.3)",
          borderRadius: "30px",
          fontSize: "48px",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          height: "150px", display: "flex", alignItems: "center"
        }}
      >
        {visibleText}
        {frame % 30 < 15 && <span style={{ width: "6px", height: "50px", backgroundColor: "#00f2ff", marginLeft: "10px", display: "inline-block" }} />}
      </div>

      <div style={{ position: "relative", flex: 1, marginTop: "60px", overflow: "hidden" }}>
        {/* Simple Node Graph */}
        <svg width="100%" height="100%">
          {/* Draw edges first */}
          {graphNodes.map((n, i) => {
            if (i === 0) return null;
            const prev = graphNodes[i - 1];

            // Connecting edge appears at the popFrame of the target node
            const edgeOpacity = interpolate(frame, [n.popFrame, n.popFrame + 10], [0, 1], { extrapolateRight: "clamp" });

            return (
              <line
                key={`e-${n.id}`}
                x1={prev.x} y1={prev.y}
                x2={n.x} y2={n.y}
                stroke="rgba(0, 242, 255, 0.3)"
                strokeWidth={4}
                opacity={edgeOpacity}
              />
            )
          })}

          {/* Draw nodes */}
          {graphNodes.map((n) => {
            const scale = interpolate(frame, [n.popFrame, n.popFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            // Pulse effect when popped
            const popEffect = interpolate(frame - n.popFrame, [0, 10, 20], [1, 1.3, 1], { extrapolateRight: "clamp" });
            const finalScale = scale > 0 ? scale * popEffect : 0;
            const activeColor = frame >= n.popFrame + 20 ? "#00f2ff" : "#fff";

            return (
              <g key={n.id} transform={`translate(${n.x}, ${n.y}) scale(${finalScale})`} opacity={scale}>
                {/* Outer Glow */}
                <circle r="60" fill="rgba(0,242,255,0.15)" />
                {/* Main Node */}
                <circle r="40" fill="#0c0c12" stroke={activeColor} strokeWidth={4} />
                <text
                  y={70}
                  textAnchor="middle"
                  fill={activeColor}
                  fontFamily="system-ui"
                  fontSize="24px"
                  fontWeight="bold"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

    </AbsoluteFill>
  );
};
