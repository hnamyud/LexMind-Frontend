"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KnowledgeGraphSection from "@/components/home/KnowledgeGraphSection";
import { authService } from "@/lib/authService";
import { useAuthHasHydrated, useAuthStore } from "@/store/authStore";
import { MdButton } from "@/components/ui/MdButton";
import { MdIconButton } from "@/components/ui/MdIconButton";
import { MdSurface } from "@/components/ui/MdSurface";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useAuthHasHydrated();
  const { accessToken, fetchProfile } = useAuthStore();

  useEffect(() => {
    const token =
      searchParams.get("token") ||
      searchParams.get("accessToken") ||
      searchParams.get("access_token");
    const refreshToken =
      searchParams.get("refreshToken") ||
      searchParams.get("refresh_token") ||
      undefined;

    if (!token) return;

    authService.handleGoogleCallback(token, refreshToken);
    const jwtUser = decodeJwtPayload(token);
    const fallbackUser = jwtUser
      ? {
          id: String(jwtUser.id ?? ""),
          email: String(jwtUser.email ?? ""),
          name: String(jwtUser.name ?? jwtUser.email ?? "Google user"),
          role: jwtUser.role,
        }
      : null;

    useAuthStore.setState({
      accessToken: token,
      user: fallbackUser,
      isLoading: false,
      error: null,
    });

    const target = fallbackUser?.role === "ADMIN" ? "/admin" : "/chat";
    router.replace(target);
    fetchProfile().catch(() => undefined);
  }, [fetchProfile, router, searchParams]);

  const handleGoPrimary = () => {
    if (!hasHydrated) return;
    router.push(accessToken ? "/chat" : "/login");
  };

  return (
    <div className="min-h-screen overflow-x-hidden md3-hero">
      <div className="mx-auto max-w-[1380px] px-4 pb-20 pt-4 md:px-8">
        <header className="md3-glass flex items-center justify-between rounded-[32px] border border-[var(--border-primary)] px-4 py-3 shadow-[var(--shadow-panel)] md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">LexMind</p>
              <p className="text-xs text-[var(--text-muted)]">Legal intelligence, grounded in source law</p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            <MdButton variant="text" tone="secondary" onClick={() => document.getElementById("knowledge-map")?.scrollIntoView({ behavior: "smooth" })}>
              Graph
            </MdButton>
            <MdButton variant="text" tone="secondary" onClick={() => document.getElementById("product-shell")?.scrollIntoView({ behavior: "smooth" })}>
              Tính năng
            </MdButton>
            {!accessToken && (
              <MdButton variant="tonal" tone="secondary" onClick={() => router.push("/login")}>
                Đăng nhập
              </MdButton>
            )}
            <MdButton onClick={handleGoPrimary} disabled={!hasHydrated}>
              Bắt đầu
            </MdButton>
          </nav>
          <MdIconButton
            className="md:hidden"
            onClick={handleGoPrimary}
            aria-label="Open LexMind"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </MdIconButton>
        </header>

        <main className="grid gap-10 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-14">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
              Material 3 · Design workflow
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
                Câu trả lời pháp lý tinh gọn, giữ trọn căn cứ gốc.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                LexMind phá vỡ sự phức tạp của văn bản luật bằng hệ thống câu trả lời chính xác, minh bạch, tự động trích dẫn nguồn điều khoản và tối ưu hóa luồng tra cứu của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <MdButton size="lg" onClick={handleGoPrimary} disabled={!hasHydrated}>
                Bắt đầu tra cứu
              </MdButton>
              <MdButton variant="outlined" tone="secondary" size="lg" onClick={() => router.push("/presentation")}>
                Xem demo
              </MdButton>
            </div>

          </section>

          <section id="product-shell" className="relative">
            <div className="absolute inset-0 -z-10 rounded-[40px] md3-mesh blur-2xl" />
            <MdSurface glass className="overflow-hidden p-4 md:p-5">
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">LexMind chat shell</p>
                  <p className="text-xs text-[var(--text-muted)]">Material 3 surfaces + legal citation chips</p>
                </div>
                <div className="rounded-full bg-[var(--surface-container)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                  Pháp lý
                </div>
              </div>

              <div className="space-y-4 px-2 py-5">
                <div className="flex justify-end">
                  <div className="max-w-[75%] rounded-[22px] rounded-tr-md bg-[var(--bg-bubble-user)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-bubble)]">
                    Xe máy đi vào đường cao tốc bị phạt thế nào?
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="max-w-[86%] rounded-[24px] rounded-tl-md border border-[var(--border-primary)] bg-[var(--bg-bubble-ai)] px-4 py-4 shadow-[var(--shadow-bubble)]">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                      Hành vi này thường bị xử phạt từ <strong className="text-[var(--text-primary)]">4.000.000 đến 6.000.000 đồng</strong> và có thể bị trừ điểm GPLX tùy tình tiết.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Điều 7 · NĐ 168/2024</span>
                      <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Khoản 13 · Điểm c</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[var(--surface-container-high)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Hỏi LexMind về văn bản, điều, khoản, tình huống pháp lý...
                    <span className="ml-auto material-symbols-outlined text-[18px]">mic</span>
                  </div>
                </div>
              </div>
            </MdSurface>
          </section>
        </main>
      </div>

      <section id="knowledge-map" className="pt-10">
        <KnowledgeGraphSection />
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
