"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NeuralMeshBackground from "@/components/home/NeuralMeshBackground";
import { authService } from "@/lib/authService";
import { setAccessToken } from "@/lib/apiClient";

function HomePageInner() {
  const { fetchProfile } = useAuthStore();
  const { accessToken, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Xử lý Google OAuth2 callback: ?token=<access-token>
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    // Lưu token vào localStorage và store
    setAccessToken(token);

    fetchProfile().then(() => {
      // Lấy user từ store để check role
      const user = useAuthStore.getState().user as Record<string, unknown> | null;
      if (user?.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/chat");
      }
    });
  }, [searchParams, fetchProfile, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

// ─── ChatBubble Demo Component ───────────────────────────────────────────────
const USER_Q = "Tôi 17 tuổi lái xe máy 110cc thì có vi phạm luật giao thông không?";
const BOT_A_PARTS = {
  intro: "Hành vi vi phạm:",
  detail: "Người từ đủ 16 tuổi đến dưới 18 tuổi điều khiển xe mô tô có dung tích xi-lanh từ 50 cm³ trở lên.",
  lawRefs: [
    "Điều 18, Khoản 4, Điểm a, NĐ 168/2024"
  ],
  analysis: "Bạn 17 tuổi — thuộc nhóm \"người từ đủ 16 tuổi đến dưới 18 tuổi\". Xe máy 110cc là xe mô tô có dung tích xi-lanh từ 50 cm³ trở lên — đây là vi phạm về điều kiện người điều khiển phương tiện.",
  penalty: "Phạt tiền từ 400.000đ đến 600.000đ"
};

function useTypewriter(text: string, speed = 18, startDelay = 0, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    let i = 0;
    setDisplayed("");
    setDone(false);
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t);
  }, [active, text, speed, startDelay]);
  return { displayed, done };
}

function ChatBubbleDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle"|"user"|"thinking"|"bot">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    setPhase("user");
  }, [visible]);

  const fullBotText = `${BOT_A_PARTS.intro} ${BOT_A_PARTS.detail}\n\n${BOT_A_PARTS.analysis}\n\n${BOT_A_PARTS.penalty}`;
  const qTyper = useTypewriter(USER_Q, 22, 200, phase === "user" || phase === "thinking" || phase === "bot");
  const aTyper = useTypewriter(fullBotText, 12, 0, phase === "bot");

  useEffect(() => {
    if (qTyper.done && phase === "user") {
      const t = setTimeout(() => setPhase("thinking"), 400);
      return () => clearTimeout(t);
    }
  }, [qTyper.done, phase]);
  useEffect(() => {
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("bot"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [qTyper.displayed, aTyper.displayed]);

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden shadow-2xl text-left" style={{ border: "1px solid rgba(0,210,235,0.15)", backgroundColor: "rgba(12,12,18,0.7)", backdropFilter: "blur(20px)" }}>
      {/* Window bar */}
      <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="size-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />)}
        </div>
        <div className="flex-1 text-center text-[11px] font-semibold tracking-wide" style={{ color: "#64748b" }}>LexMind Chat</div>
      </div>

      {/* Chat body */}
      <div ref={bodyRef} className="flex flex-col gap-4 p-5 md:p-6 overflow-y-auto" style={{ minHeight: "340px", maxHeight: "440px" }}>
        {/* User bubble */}
        {phase !== "idle" && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: "rgba(0,210,235,0.12)", border: "1px solid rgba(0,210,235,0.2)", color: "#e2e8f0" }}>
              {qTyper.displayed}
              {!qTyper.done && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse rounded-sm" style={{ backgroundColor: "#00f2ff" }} />}
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {phase === "thinking" && (
          <div className="flex gap-3 items-start">
            <div className="size-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(0,210,235,0.2), rgba(0,180,200,0.1))" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#00f2ff" }}>smart_toy</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-[12px] flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(0,210,235,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: "#00d2eb" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: "#00d2eb" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: "#00d2eb" }} />
              <span className="ml-1 text-[11px]">Đang phân tích Nghị định 168/2024...</span>
            </div>
          </div>
        )}

        {/* Bot answer */}
        {phase === "bot" && (
          <div className="flex gap-3 items-start">
            <div className="size-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(0,210,235,0.2), rgba(0,180,200,0.1))" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#00f2ff" }}>smart_toy</span>
            </div>
            <div className="max-w-[85%] flex flex-col gap-3">
              {/* Main content bubble */}
              <div className="rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#cbd5e1" }}>
                <p className="whitespace-pre-wrap">{aTyper.displayed}</p>
                {!aTyper.done && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse rounded-sm" style={{ backgroundColor: "#00f2ff" }} />}
              </div>

              {/* Law reference chips - show after typing done */}
              {aTyper.done && (
                <div className="flex flex-wrap gap-1.5 pl-1 animate-[fadeIn_0.4s_ease-out]">
                  {BOT_A_PARTS.lawRefs.map((ref) => (
                    <span key={ref} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: "rgba(0,210,235,0.1)", border: "1px solid rgba(0,210,235,0.2)", color: "#00d2eb" }}>
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  return (
    <div
      style={{ backgroundColor: "#050505", color: "#f1f5f9" }}
      className="min-h-screen font-[family-name:var(--font-public-sans)] selection:bg-[#00f2ff33]"
    >
      <div className="relative min-h-screen overflow-hidden">
        {/* Background: Neural Network Mesh (Vanta NET) */}
        <div className="absolute top-0 left-0 w-full h-[70vh] sm:h-[800px] z-0"
             style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}>
          <NeuralMeshBackground />
        </div>

        {/* Deep space gradient overlay for depth */}
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,20,30,0.3) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(5,5,5,0.8) 0%, transparent 50%)"
        }} />

        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between px-4 py-6 md:px-12 lg:px-24">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div
              className="size-8 rounded flex items-center justify-center"
              style={{
                backgroundColor: "#00f2ff",
                boxShadow: "0 0 15px rgba(0,242,255,0.4)",
              }}
            >
              <span
                className="material-symbols-outlined font-bold"
                style={{ color: "#050505" }}
              >
                gavel
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase text-white">
              LexMind
            </h2>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a
              className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
              style={{ color: "#94a3b8" }}
              href="#features"
            >
              About
            </a>
            <a
              className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
              style={{ color: "#94a3b8" }}
              href="#features"
            >
              Features
            </a>
            {mounted && !!accessToken ? (
              <button
                onClick={() => logout()}
                className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
                style={{ color: "#94a3b8" }}
              >
                Logout
              </button>
            ) : (
              <Link
                className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
                style={{ color: "#94a3b8" }}
                href="/login"
              >
                Login
              </Link>
            )}
            <Link
              href="/chat"
              className="text-xs font-bold px-6 py-2 rounded uppercase tracking-widest transition-all duration-300"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              Try LexMind
            </Link>
          </nav>

          <button className="md:hidden text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-8 pb-16 text-center md:px-6 md:pt-16 lg:pt-20">
          {/* Beta Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full"
            style={{
              border: "1px solid rgba(0,242,255,0.3)",
              backgroundColor: "rgba(0,242,255,0.05)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#00f2ff" }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: "#00f2ff" }}
              ></span>
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#00f2ff" }}
            >
              Now in Private Beta
            </span>
          </div>

          {/* Headline – Serif/Sans-serif mix */}
          <h1 className="max-w-4xl text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[1.1] md:leading-[0.9] text-white mb-6 md:mb-8">
            THE INTELLIGENCE <br className="hidden md:block" />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff, #00d2eb, rgba(255,255,255,0.4))",
              }}
            >
              BEHIND MODERN{" "}
            </span>
            <span
              className="font-[family-name:var(--font-playfair)] italic"
              style={{
                color: "#ffffff",
                textShadow: "0 0 40px rgba(0,210,235,0.3)",
              }}
            >
              LAW.
            </span>
          </h1>

          <p
            className="max-w-xl text-base md:text-lg lg:text-xl font-light mb-10 md:mb-12 leading-relaxed"
            style={{ color: "#94a3b8" }}
          >
            Advanced legal AI designed for precision, speed, and
            professional-grade insights. Built for the next generation of
            counsel.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Link
              href="/chat"
              className="group relative flex items-center justify-center h-14 px-10 font-bold uppercase tracking-widest rounded transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "#00f2ff",
                color: "#000000",
                boxShadow: "0 0 30px rgba(0,242,255,0.2)",
              }}
            >
              Get Started
              <span className="material-symbols-outlined ml-2 text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
            <button
              className="flex items-center justify-center h-14 px-10 font-bold uppercase tracking-widest rounded transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
              }}
            >
              View Demo
            </button>
          </div>

          {/* Chat Bubble Demo */}
          <div className="mt-10 md:mt-12 w-full max-w-5xl mx-auto px-4">
            <ChatBubbleDemo />
          </div>
        </main>

        {/* Features Grid */}
        <section
          id="features"
          className="relative z-10 px-4 py-16 md:px-12 lg:px-24 md:py-24"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div
              className="p-8 md:p-12 space-y-4 md:space-y-6 transition-colors cursor-default border-b border-white/5 md:border-b-0"
              style={{ backgroundColor: "rgba(255,255,255,0.01)" }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: "#00f2ff" }}
              >
                search_insights
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Agentic Legal Graph
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Deep-dive into Decree 168/2024 through Neo4j Knowledge Graph with sub-second latency and semantic accuracy.
              </p>
            </div>
            <div
              className="p-8 md:p-12 space-y-4 md:space-y-6 transition-colors cursor-default border-b border-white/5 md:border-b-0 md:border-l md:border-r border-white/5"
              style={{
                backgroundColor: "rgba(255,255,255,0.01)",
              }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: "#00f2ff" }}
              >
                security
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Official Data Sovereignty
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Real-time updates from the Ministry of Justice. Your queries are encrypted and never used to train public models.
              </p>
            </div>
            <div
              className="p-12 space-y-6 transition-colors cursor-default"
              style={{ backgroundColor: "rgba(255,255,255,0.01)" }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: "#00f2ff" }}
              >
                auto_awesome
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Penalty &amp; Point Engine
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Automatically simulate fine levels and GPLX point deductions with professional precision and intelligent logic control.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="relative z-10 px-4 py-8 md:px-12 lg:px-24 md:py-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="size-6 bg-white rounded-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-xs font-bold">
                  gavel
                </span>
              </div>
              <span className="text-sm font-bold tracking-tighter uppercase text-white">
                LexMind
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {["Privacy", "Terms", "Security"].map((item) => (
                <a
                  key={item}
                  className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: "#64748b" }}
                  href="#"
                >
                  {item}
                </a>
              ))}
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#475569" }}
            >
              © 2024 LEXI INTELLIGENCE SYSTEMS
            </p>
          </div>
        </footer>
      </div>
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
