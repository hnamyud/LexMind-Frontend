import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig, Audio } from "remotion";
import StarryBackground from "@/components/home/StarryBackground";
import { useRouter } from "next/navigation";

export const Slide5CTA: React.FC = () => {
  const router = useRouter();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  const buttonScale = spring({
    frame: Math.max(0, frame - 45),
    fps,
    config: { damping: 12 }
  });

  const flareOpacity = interpolate(frame, [45, 60, 90, 150], [0, 1, 0.8, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: bgOpacity }}>
      <Audio src="/presentation/audio/slide_5.mp3" />
      {/* Starry Universe Background */}
      <StarryBackground />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 10 }}>
        {/* Glowing flare behind the button */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "150px",
            background: "radial-gradient(ellipse at center, rgba(0,242,255,0.4) 0%, transparent 70%)",
            opacity: flareOpacity,
            transform: `scale(${buttonScale})`
          }}
        />

        <div
          onClick={(e) => {
            e.stopPropagation(); // prevent remotion player from pausing
            router.push("/chat");
          }}
          style={{
            transform: `scale(${buttonScale})`,
            padding: "24px 64px",
            borderRadius: "12px",
            backgroundColor: "#00f2ff",
            color: "#000",
            fontSize: "42px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            boxShadow: "0 0 60px rgba(0,242,255,0.6)",
            fontFamily: "system-ui, sans-serif",
            cursor: "pointer",
            pointerEvents: "auto"
          }}
        >
          Bắt đầu ngay
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
