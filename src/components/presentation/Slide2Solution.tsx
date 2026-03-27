import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig, Audio } from "remotion";

export const Slide2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Logo spring at frame 10
  const logoScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14 } });

  // Sweep light effect starting at frame 40, duration 30
  const sweepX = interpolate(frame, [40, 70], [-200, width + 500], { extrapolateRight: "clamp" });

  // Neural mesh dots opacity
  const meshOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const nodes = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 4 + 2,
    vx: Math.random() * 0.4 - 0.2, // very slow drift
    vy: Math.random() * 0.4 - 0.2
  })), []);

  const edges = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (dx * dx + dy * dy < 400) {
          lines.push({ source: nodes[i], target: nodes[j] });
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      <Audio src="/presentation/audio/slide_2.mp3" />
      {/* Background sweep clearing out the old text conceptually */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: sweepX,
          width: "2px",
          backgroundColor: "#00f2ff",
          boxShadow: "0 0 120px 40px rgba(0,242,255,0.7)",
          zIndex: 5
        }}
      />

      {/* Neural Mesh SVG (Visible after sweep) */}
      <AbsoluteFill style={{ opacity: meshOpacity, zIndex: 1 }}>
        <svg width="100%" height="100%">
          {edges.map((e, idx) => (
            <line
              key={idx}
              x1={`${e.source.x + (frame * e.source.vx) * 0.2}%`}
              y1={`${e.source.y + (frame * e.source.vy) * 0.2}%`}
              x2={`${e.target.x + (frame * e.target.vx) * 0.2}%`}
              y2={`${e.target.y + (frame * e.target.vy) * 0.2}%`}
              stroke="rgba(0, 242, 255, 0.2)"
              strokeWidth={1}
            />
          ))}
          {nodes.map((n, idx) => (
            <circle
              key={idx}
              cx={`${n.x + (frame * n.vx) * 0.2}%`}
              cy={`${n.y + (frame * n.vy) * 0.2}%`}
              r={n.r}
              fill="#00f2ff"
              opacity={0.8}
            />
          ))}
        </svg>
      </AbsoluteFill>

      {/* LexMind Logo in Center */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 10 }}>
        <div style={{ transform: `scale(${logoScale})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "120px", height: "120px",
              backgroundColor: "#00f2ff",
              borderRadius: "24px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 60px rgba(0,242,255,0.4)",
              marginBottom: "30px"
            }}
          >
            {/* Using a simple text icon simulation for "Gavel" since material symbols might not load smoothly in Remotion without setup */}
            <span style={{ fontSize: "64px", fontWeight: "bold", color: "#000", fontFamily: "system-ui" }}>L</span>
          </div>
          <h1 style={{ fontSize: "72px", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "0.05em", fontFamily: "system-ui" }}>
            LEXMIND
          </h1>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
