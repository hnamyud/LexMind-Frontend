import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, displayFont, sceneStyle, slideUp } from "./theme";

export const Slide5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const button = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 14 } });
  const glow = interpolate(frame, [35, 80, 150, 210], [0, 1, 0.72, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ ...sceneStyle, justifyContent: "center", alignItems: "center", textAlign: "center", padding: 96 }}>
      <Audio src="/presentation/audio/slide_5.mp3" />

      <div style={{ position: "absolute", width: 860, height: 360, borderRadius: 999, background: colors.primaryContainer, filter: "blur(70px)", opacity: glow * 0.9 }} />

      <div style={{ ...slideUp(frame, 14), position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, borderRadius: 999, padding: "12px 22px", background: colors.primaryContainer, color: colors.primary, fontSize: 22, fontWeight: 800 }}>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: colors.primary }} />
          Material 3 · Legal-first AI
        </div>

        <h1 style={{ margin: "34px auto 0", maxWidth: 1120, fontSize: 92, lineHeight: 1.03, letterSpacing: "-0.035em", fontWeight: 840, fontFamily: displayFont }}>
          Demo LexMind trong một luồng sáng, rõ và có căn cứ.
        </h1>
        <p style={{ margin: "26px auto 0", maxWidth: 860, color: colors.muted, fontSize: 30, lineHeight: 1.45 }}>
          Từ câu hỏi tự nhiên đến câu trả lời có citation, graph và admin workflow.
        </p>

        <div
          style={{
            margin: "48px auto 0",
            transform: `scale(${button})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "24px 44px",
            borderRadius: 999,
            background: colors.primary,
            color: "#fff",
            fontSize: 32,
            fontWeight: 820,
            boxShadow: "0 24px 50px rgba(15,108,122,0.28)",
          }}
        >
          Bắt đầu tra cứu
          <span style={{ fontSize: 34 }}>→</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
