"use client";

import Link from "next/link";
import { Player } from "@remotion/player";
import { LexMindPresentation } from "@/components/presentation/LexMindPresentation";

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-4 text-[var(--text-primary)] md:px-8 md:py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-7xl flex-col gap-4 md:gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-2xl text-[var(--text-secondary)] shadow-[var(--shadow-bubble)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            aria-label="Quay lại trang chủ"
          >
            ×
          </Link>
          <div className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-xs font-medium text-[var(--accent)] md:px-4 md:text-sm">
            LexMind demo video
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <div className="w-full overflow-hidden rounded-[24px] border border-[var(--border-primary)] bg-[var(--surface-glass)] p-2.5 shadow-[var(--shadow-panel)] backdrop-blur-xl md:rounded-[32px] md:p-4">
            <Player
              component={LexMindPresentation}
              durationInFrames={1500}
              compositionWidth={1920}
              compositionHeight={1080}
              fps={30}
              acknowledgeRemotionLicense
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "24px",
                overflow: "hidden",
                backgroundColor: "var(--bg-primary)",
              }}
              controls
              autoPlay
              loop
            />
          </div>
        </main>
      </div>
    </div>
  );
}
