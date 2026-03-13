"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StarryBackground from "@/components/home/StarryBackground";
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

    // Fetch profile để cập nhật thông tin user vào store
    fetchProfile().then(() => {
      // Sau đó redirect sang /chat và xóa token khỏi URL
      router.replace("/chat");
    });
  }, [searchParams, fetchProfile, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

// ─── Terminal Demo Component ───────────────────────────────────────────────────
const USER_Q = "Tôi 17 tuổi lái xe máy 110cc thì có vi phạm luật giao thông không?";
const BOT_A = `Hành vi vi phạm: Người từ đủ 16 tuổi đến dưới 18 tuổi điều khiển xe mô tô có dung tích xi-lanh từ 50 cm3 trở lên.

Luật áp dụng: [Điều 18, Khoản 4, Điểm a, Nghị định 168/2024/NĐ-CP]

Phân tích: Bạn 17 tuổi — "người từ đủ 16 tuổi đến dưới 18 tuổi". Xe máy 110cc là "xe mô tô có dung tích xi-lanh từ 50 cm3 trở lên" — đây là hành vi vi phạm về điều kiện người điều khiển xe cơ giới.

Hình phạt: Phạt tiền từ 400.000 đồng đến 600.000 đồng.`;

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

function TerminalDemo() {
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

  const qTyper = useTypewriter(USER_Q, 22, 200, phase === "user" || phase === "thinking" || phase === "bot");
  const aTyper = useTypewriter(BOT_A, 10, 0, phase === "bot");

  // After user Q done → thinking → bot answer
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
    <div ref={ref} className="relative rounded-xl p-2 overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(18,18,18,0.4)", backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,242,255,0.05), transparent)" }} />
      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="size-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />)}
        </div>
        <div className="flex-1 text-center text-[10px] uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>LexMind Terminal v1.0.4</div>
      </div>
      {/* Body */}
      <div ref={bodyRef} className="rounded-b-lg flex flex-col gap-5 p-6 text-left overflow-y-auto" style={{ backgroundColor: "rgba(5,5,5,0.85)", minHeight: "340px", maxHeight: "440px" }}>
        {/* User bubble */}
        {phase !== "idle" && (
          <div className="flex justify-end gap-3 items-end">
            <div className="max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed font-mono" style={{ backgroundColor: "rgba(0,242,255,0.1)", border: "1px solid rgba(0,242,255,0.2)", color: "#e2e8f0" }}>
              {qTyper.displayed}
              {!qTyper.done && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: "#00f2ff" }} />}
            </div>
            <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <span className="material-symbols-outlined text-xs" style={{ color: "#94a3b8" }}>person</span>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {phase === "thinking" && (
          <div className="flex gap-3 items-start">
            <div className="size-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,242,255,0.2)" }}>
              <span className="material-symbols-outlined text-xs" style={{ color: "#00f2ff" }}>smart_toy</span>
            </div>
            <div className="px-4 py-3 rounded-xl text-[11px] font-mono flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(0,242,255,0.7)", border: "1px solid rgba(0,242,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: "#00f2ff" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: "#00f2ff" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: "#00f2ff" }} />
              <span className="ml-1 uppercase tracking-widest">Đang phân tích Nghị định 168/2024...</span>
            </div>
          </div>
        )}

        {/* Bot answer */}
        {phase === "bot" && (
          <div className="flex gap-3 items-start">
            <div className="size-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,242,255,0.2)" }}>
              <span className="material-symbols-outlined text-xs" style={{ color: "#00f2ff" }}>smart_toy</span>
            </div>
            <div className="max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1" }}>
              {aTyper.displayed}
              {!aTyper.done && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: "#00f2ff" }} />}
            </div>
          </div>
        )}

        {/* Footer status */}
        <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(0,242,255,0.5)" }}>
            {phase === "idle" && "LEXMIND READY..."}
            {phase === "user" && "RECEIVING QUERY..."}
            {phase === "thinking" && "ANALYZING DECREE 168/2024... [NĐ-CP]"}
            {phase === "bot" && (aTyper.done ? "✓ RESPONSE COMPLETE" : "STREAMING ANSWER...")}
          </span>
          <div className="flex gap-2">
            <div className="h-2 w-12 rounded" style={{ backgroundColor: phase !== "idle" ? "rgba(0,242,255,0.3)" : "rgba(255,255,255,0.1)" }} />
            <div className="h-2 w-8 rounded" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
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
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <StarryBackground />
        </div>

        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between px-6 py-8 md:px-12 lg:px-24">
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
        <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center md:pt-32 lg:pt-48">
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

          {/* Headline */}
          <h1 className="max-w-4xl text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white mb-8">
            THE INTELLIGENCE <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff, #00f2ff, rgba(255,255,255,0.4))",
              }}
            >
              BEHIND MODERN LAW.
            </span>
          </h1>

          <p
            className="max-w-xl text-lg md:text-xl font-light mb-12 leading-relaxed"
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

          {/* Terminal Mockup */}
          <div className="mt-32 w-full max-w-5xl mx-auto px-4">
            <TerminalDemo />
          </div>
        </main>

        {/* Features Grid */}
        <section
          id="features"
          className="relative z-10 px-6 py-24 md:px-12 lg:px-24"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div
              className="p-12 space-y-6 transition-colors cursor-default"
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
              className="p-12 space-y-6 transition-colors cursor-default"
              style={{
                backgroundColor: "rgba(255,255,255,0.01)",
                borderLeft: "1px solid rgba(255,255,255,0.05)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
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
          className="relative z-10 px-6 py-12 md:px-12 lg:px-24"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
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
            <div className="flex gap-8">
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
