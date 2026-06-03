"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KnowledgeGraphSection from "@/components/home/KnowledgeGraphSection";
import { authService } from "@/lib/authService";
import { useAuthHasHydrated, useAuthStore } from "@/store/authStore";
import { MdButton } from "@/components/ui/MdButton";
import { MdIconButton } from "@/components/ui/MdIconButton";
import { MdSurface } from "@/components/ui/MdSurface";

function FeatureBentoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="mx-auto max-w-[1380px] px-4 py-14 md:px-8 md:py-24">
      <div className="mb-8 max-w-3xl md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          Tính năng lõi
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          Một workspace pháp lý được thiết kế để tra cứu, kiểm chứng và vận hành nhanh hơn.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <article
          className={`md3-feature-card feature-reveal min-h-[360px] overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl md:min-h-[430px] md:rounded-[32px] md:p-7 lg:col-span-8 ${
            visible ? "is-visible" : ""
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-end">
            <div className="max-w-xl flex-1">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">RAG-powered Chat</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
                Tra cứu tự nhiên, phản hồi chính xác
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] md:text-base md:leading-8">
                Không còn mơ hồ với các câu trả lời AI thông thường. LexMind bóc tách ngữ cảnh câu hỏi, đối chiếu trực tiếp với hệ thống văn bản pháp luật hiện hành để đưa ra lời giải thích ngắn gọn, dễ hiểu nhất.
              </p>
            </div>

            <div className="w-full rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3.5 shadow-[var(--shadow-bubble)] md:rounded-[28px] md:p-4 lg:max-w-[390px]">
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">LexMind</p>
                  <p className="text-xs text-[var(--text-muted)]">Đang đối chiếu nguồn luật</p>
                </div>
              </div>
              <div className="chat-demo-user ml-auto max-w-[90%] rounded-[22px] rounded-tr-md bg-[var(--bg-bubble-user)] px-3.5 py-3 text-sm leading-6 text-[var(--text-primary)] md:max-w-[82%] md:px-4">
                Xe máy vượt đèn đỏ bị xử phạt như nào?
              </div>
              <div className="chat-demo-bot mt-4 rounded-[22px] rounded-tl-md border border-[var(--border-primary)] bg-[var(--bg-bubble-ai)] px-3.5 py-3.5 md:rounded-[24px] md:px-4 md:py-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Xe máy vượt đèn đỏ bị phạt tiền từ <mark className="rounded-md bg-[var(--accent-soft)] px-1 text-[var(--accent)]">4.000.000 đến 6.000.000 đồng</mark> và trừ <strong className="text-[var(--text-primary)]">4 điểm</strong> trên Giấy phép lái xe (GPLX). Nếu gây tai nạn giao thông, mức phạt tăng lên <mark className="rounded-md bg-[var(--legal-soft)] px-1 text-[var(--legal)]">10.000.000 đến 14.000.000 đồng</mark> và trừ <strong className="text-[var(--text-primary)]">10 điểm GPLX</strong>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Điểm c khoản 7 Điều 7</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Điểm b khoản 10 Điều 7</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">NĐ 168/2024/NĐ-CP</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article
          className={`md3-feature-card feature-reveal min-h-[320px] overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-panel)] md:min-h-[430px] md:rounded-[32px] md:p-7 lg:col-span-4 ${
            visible ? "is-visible" : ""
          }`}
          style={{ transitionDelay: "90ms" }}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--legal-soft)] text-[var(--legal)]">
            <span className="material-symbols-outlined text-[24px]">hub</span>
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">Knowledge Graph</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-2xl">
            Trực quan hóa mối liên kết luật
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            Hệ thống tự động liên kết Hành vi vi phạm, Điều khoản liên quan và Mức xử phạt dưới dạng mạng lưới trực quan để bạn truy vết toàn bộ căn cứ chỉ với một cú click.
          </p>

          <div className="relative mt-6 h-40 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-container-low)] md:mt-8 md:h-44 md:rounded-[28px]">
            <div className="absolute left-[18%] top-[30%] h-14 w-14 rounded-full bg-[var(--graph-violation)] shadow-[0_0_28px_var(--graph-edge-active)]" />
            <div className="absolute left-[48%] top-[18%] h-16 w-16 rounded-full bg-[var(--graph-provision)] shadow-[0_0_28px_var(--legal-border)]" />
            <div className="absolute right-[16%] bottom-[22%] h-14 w-14 rounded-full bg-[var(--graph-penalty)] shadow-[0_0_28px_var(--success-border)]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 180" aria-hidden="true">
              <path d="M75 72 C120 30, 138 32, 170 52" fill="none" stroke="var(--graph-edge-active)" strokeWidth="3" opacity="0.45" />
              <path d="M178 65 C220 86, 236 104, 260 126" fill="none" stroke="var(--graph-edge-active)" strokeWidth="3" opacity="0.45" />
            </svg>
          </div>
        </article>

        <article
          className={`md3-feature-card feature-reveal min-h-[220px] overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-bubble)] md:min-h-[260px] md:rounded-[32px] md:p-7 lg:col-span-6 ${
            visible ? "is-visible" : ""
          }`}
          style={{ transitionDelay: "180ms" }}
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">Grounded Citations</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-2xl">
                Tuyệt đối nói không với “Ảo giác AI”
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Mọi luận điểm, con số hay mức phạt đều đi kèm căn cứ pháp lý gốc để người dùng kiểm chứng ngay lập tức.
              </p>
            </div>
          </div>
          <div className="mt-7 overflow-hidden rounded-full border border-[var(--legal-border)] bg-[var(--legal-soft)] py-2">
            <div className="citation-marquee flex w-max gap-2 px-2">
              {["NĐ 168/2024", "Điều 7", "Khoản 13", "Điểm c", "Luật GTĐB", "GPLX"].concat(["NĐ 168/2024", "Điều 7", "Khoản 13", "Điểm c", "Luật GTĐB", "GPLX"]).map((chip, index) => (
                <span key={`${chip}-${index}`} className="rounded-full border border-[var(--legal-border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--legal)]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article
          className={`md3-feature-card feature-reveal min-h-[220px] overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-bubble)] backdrop-blur-xl md:min-h-[260px] md:rounded-[32px] md:p-7 lg:col-span-6 ${
            visible ? "is-visible" : ""
          }`}
          style={{ transitionDelay: "270ms" }}
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--info-soft)] text-[var(--info)]">
              <span className="material-symbols-outlined text-[24px]">speed</span>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">Ops-ready</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-2xl">
                Tăng tốc rà soát văn bản
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Admin console hỗ trợ scan nhanh, lọc thông minh và duyệt thông tin theo thời gian thực để xử lý khối lượng lớn dữ liệu thô mượt mà.
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-2 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-container-low)] p-3">
            {[
              ["Scan dữ liệu", "98%"],
              ["Lọc nguồn luật", "42ms"],
              ["Review queue", "Live"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-[var(--bg-secondary)] px-4 py-3 text-sm">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="font-semibold text-[var(--accent)]">{value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

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
      <div className="landing-hero-shell mx-auto max-w-[1380px] overflow-hidden px-4 pb-16 pt-4 md:px-8 md:pb-20">
        <header className="md3-glass flex items-center justify-between gap-3 rounded-[24px] border border-[var(--border-primary)] px-3 py-3 shadow-[var(--shadow-panel)] md:rounded-[32px] md:px-6">
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
            <MdButton variant="text" tone="secondary" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
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
          <div className="flex items-center gap-2 md:hidden">
            {!accessToken && (
              <MdButton variant="tonal" tone="secondary" size="sm" onClick={() => router.push("/login")}>
                Đăng nhập
              </MdButton>
            )}
            <MdIconButton onClick={handleGoPrimary} aria-label="Open LexMind">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </MdIconButton>
          </div>
        </header>

        <main className="grid min-w-0 max-w-full gap-8 overflow-hidden pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pt-14">
          <section className="min-w-0 max-w-full space-y-5 overflow-hidden md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
              Material 3 · Design workflow
            </div>

            <div className="space-y-4 md:space-y-5">
              <h1 className="max-w-4xl text-balance text-[2.15rem] font-semibold leading-[1.02] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
                Câu trả lời pháp lý tinh gọn, giữ trọn căn cứ gốc.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                LexMind phá vỡ sự phức tạp của văn bản luật bằng hệ thống câu trả lời chính xác, minh bạch, tự động trích dẫn nguồn điều khoản và tối ưu hóa luồng tra cứu của bạn.
              </p>
            </div>

            <div className="flex min-w-0 max-w-full flex-col gap-3 sm:flex-row">
              <MdButton className="w-full sm:w-auto" size="lg" onClick={handleGoPrimary} disabled={!hasHydrated}>
                Bắt đầu tra cứu
              </MdButton>
              <MdButton className="w-full sm:w-auto" variant="outlined" tone="secondary" size="lg" onClick={() => router.push("/presentation")}>
                Xem demo
              </MdButton>
            </div>

          </section>

          <section id="product-shell" className="relative min-w-0 max-w-full overflow-hidden">
            <div className="absolute inset-0 -z-10 rounded-[40px] md3-mesh blur-2xl" />
            <MdSurface glass className="min-w-0 max-w-full overflow-hidden p-3.5 md:p-5">
              <div className="flex min-w-0 items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">LexMind chat shell</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">Material 3 surfaces + legal citation chips</p>
                </div>
                <div className="hidden rounded-full bg-[var(--surface-container)] px-3 py-1 text-xs text-[var(--text-secondary)] sm:block">
                  Pháp lý
                </div>
              </div>

              <div className="min-w-0 max-w-full space-y-3.5 overflow-hidden px-1 py-4 md:space-y-4 md:px-2 md:py-5">
                <div className="flex min-w-0 justify-end">
                  <div className="chat-demo-user max-w-[88%] break-words rounded-[22px] rounded-tr-md bg-[var(--bg-bubble-user)] px-3.5 py-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-bubble)] sm:max-w-[75%] sm:px-4">
                    Xe máy vượt đèn đỏ bị xử phạt như nào?
                  </div>
                </div>

                <div className="min-w-0 max-w-full space-y-3 overflow-hidden">
                  <div className="chat-demo-bot min-w-0 max-w-full overflow-hidden rounded-[22px] rounded-tl-md border border-[var(--border-primary)] bg-[var(--bg-bubble-ai)] px-3.5 py-3.5 shadow-[var(--shadow-bubble)] sm:max-w-[86%] sm:rounded-[24px] sm:px-4 sm:py-4">
                    <p className="break-words text-sm leading-7 text-[var(--text-secondary)]">
                      Xe máy vượt đèn đỏ bị phạt tiền từ <strong className="text-[var(--text-primary)]">4.000.000 đến 6.000.000 đồng</strong> và trừ <strong className="text-[var(--text-primary)]">4 điểm</strong> trên Giấy phép lái xe (GPLX). Nếu gây tai nạn giao thông, mức phạt tăng lên <strong className="text-[var(--text-primary)]">10.000.000 đến 14.000.000 đồng</strong> và trừ <strong className="text-[var(--text-primary)]">10 điểm GPLX</strong>.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Điểm c khoản 7 Điều 7</span>
                      <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">Điểm b khoản 10 Điều 7</span>
                      <span className="rounded-full px-3 py-1 text-xs font-medium md3-legal-chip">NĐ 168/2024/NĐ-CP</span>
                    </div>
                  </div>
                  <div className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-full bg-[var(--surface-container-high)] px-3 py-3 text-sm text-[var(--text-muted)] sm:px-4">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="min-w-0 flex-1 truncate">Hỏi LexMind về văn bản, điều, khoản, tình huống pháp lý...</span>
                  </div>
                </div>
              </div>
            </MdSurface>
          </section>
        </main>
      </div>

      <FeatureBentoSection />

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
