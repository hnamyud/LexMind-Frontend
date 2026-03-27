"use client";

import { Player } from "@remotion/player";
import { LexMindPresentation } from "@/components/presentation/LexMindPresentation";
import Link from "next/link";

export default function PresentationPage() {
  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Close button returning to home */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          color: "#fff",
          fontSize: "48px",
          fontWeight: "300",
          cursor: "pointer",
          zIndex: 50,
          background: "transparent",
          border: "none",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#00f2ff"; e.currentTarget.style.transform = "scale(1.1)" }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1)" }}
      >
        ×
      </Link>

      <Player
        component={LexMindPresentation}
        durationInFrames={300 + 300 + 300 + 390 + 210} // Slide 1 (10s) + Slide 2 (10s) + Slide 3 (10s) + Slide 4 (13s) + Slide 5 (7s)
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: "100%",
          maxWidth: "1280px",
          aspectRatio: "16 / 9",
          borderRadius: "12px",
          boxShadow: "0 0 50px rgba(0,242,255,0.15)"
        }}
        controls
        autoPlay
      />
    </div>
  );
}
