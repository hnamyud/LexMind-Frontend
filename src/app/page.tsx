"use client";

import Link from "next/link";
import { useAuthStore, useAuthHasHydrated } from "@/store/authStore";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NeuralMeshBackground from "@/components/home/NeuralMeshBackground";
import KnowledgeGraphSection from "@/components/home/KnowledgeGraphSection";
import { authService } from "@/lib/authService";
import { setAccessToken } from "@/lib/apiClient";
import ReactMarkdown from "react-markdown";

/**
 * Hook điều hướng thông minh:
 * - Nếu đã đăng nhập → đi thẳng /chat
 * - Nếu chưa đăng nhập → đi /login (không qua /chat làm trung gian)
 * - Nếu chưa hydrate xong → đợi, không navigate vội
 */
function useAuthAwareNav() {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const accessToken = useAuthStore((s) => s.accessToken);

  const navigate = useCallback(() => {
    if (!hasHydrated) return; // chưa hydrate, bỏ qua
    if (accessToken) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [hasHydrated, accessToken, router]);

  return { navigate, hasHydrated };
}

function HomePageInner() {
  const { fetchProfile } = useAuthStore();
  const { accessToken, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { navigate: navToChat, hasHydrated } = useAuthAwareNav();

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
  const USER_Q = "Mức phạt đối với hành vi điều khiển xe máy đi vào đường cao tốc là gì?";
  const BOT_TEXT = `**Hành vi vi phạm:** Người điều khiển xe máy (xe mô tô, xe gắn máy) đi vào đường cao tốc.

**Hình phạt:**
- Phạt tiền từ **4.000.000 đồng đến 6.000.000 đồng**.
- [Điều 7, Khoản 7, Điểm b, Nghị định 168/2024/NĐ-CP]

**Hình phạt bổ sung:**
- Bị trừ **06 điểm** trên Giấy phép lái xe.
- [Điều 7, Khoản 13, Điểm c, Nghị định 168/2024/NĐ-CP]

**Lưu ý:** 
- Quy định này không áp dụng đối với xe phục vụ việc quản lý, bảo trì đường cao tốc.
- Hành vi này được phân biệt với lỗi "đi vào khu vực cấm, đường có biển báo hiệu có nội dung cấm" thông thường.

---

*Dữ liệu tra cứu được trích xuất từ các nguồn luật hiện có trong hệ thống. Tuy nhiên, bot có thể gặp sai sót trong việc tổng hợp các tình tiết phức tạp. Chúng tôi khuyến cáo người dùng sử dụng thông tin này như một nguồn tham khảo bổ trợ và luôn tuân thủ các hướng dẫn trực tiếp từ cơ quan chức năng.*`;

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
    const [phase, setPhase] = useState<"idle" | "user" | "thinking" | "bot">("idle");

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
    const aTyper = useTypewriter(BOT_TEXT, 6, 0, phase === "bot");

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
            {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} className="size-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />)}
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
                <div className="rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm leading-relaxed flex flex-col gap-1" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#cbd5e1" }}>
                  <div className="prose prose-sm max-w-none prose-invert" style={{ '--tw-prose-body': '#cbd5e1', '--tw-prose-bold': '#ffffff', '--tw-prose-hr': 'rgba(255,255,255,0.1)' } as React.CSSProperties}>
                    <ReactMarkdown>{aTyper.displayed}</ReactMarkdown>
                  </div>
                  {!aTyper.done && <span className="inline-block w-1.5 h-3.5 align-middle animate-pulse rounded-sm mt-1" style={{ backgroundColor: "#00f2ff" }} />}
                </div>
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
              href="#neural-map"
            >
              Neural Map
            </a>
            <a
              className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
              style={{ color: "#94a3b8" }}
              href="#console"
            >
              Ask AI
            </a>
            <a
              className="text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#00f2ff]"
              style={{ color: "#94a3b8" }}
              href="#features"
            >
              Concept
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
            <button
              onClick={navToChat}
              disabled={!hasHydrated}
              className="text-xs font-bold px-6 py-2 rounded uppercase tracking-widest transition-all duration-300 disabled:opacity-60"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              Try LexMind
            </button>
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
            Nền tảng AI pháp lý — chính xác, nhanh chóng, chuyên sâu. Được xây dựng cho thế hệ pháp lý kế tiếp.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <button
              onClick={navToChat}
              disabled={!hasHydrated}
              className="group relative flex items-center justify-center h-14 px-10 font-bold uppercase tracking-widest rounded transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
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
            </button>
            <Link
              href="/presentation"
              className="flex items-center justify-center h-14 px-10 font-bold uppercase tracking-widest rounded transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
              }}
            >
              View Demo
            </Link>
          </div>
        </main>

        {/* Knowledge Graph Rendering */}
        <div id="neural-map">
          <KnowledgeGraphSection />
        </div>

        {/* Chat Bubble Demo */}
        <section id="console" className="relative z-10 w-full max-w-5xl mx-auto px-4 py-10 md:pb-24">
          <ChatBubbleDemo />
        </section>

        {/* Concept Section (Bento Grid) */}
        <section
          id="features"
          className="relative z-10 px-4 py-16 md:px-12 lg:px-24 md:py-32 flex flex-col items-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Headline & Intro (Full width) */}
          <div className="w-full max-w-4xl text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to bottom right, #ffffff, #94a3b8)" }}>
              Nơi Công nghệ gặp Pháp luật.
            </h2>
            <p className="text-base md:text-xl font-light leading-relaxed text-[#cbd5e1] max-w-3xl mx-auto">
              &quot;LexMind là dự án nghiên cứu với sứ mệnh phổ cập trí tuệ pháp lý thông qua Graph Data và Agentic RAG.&quot;
            </p>
          </div>

          {/* Bento Grid layout */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pillar 1: Data Integrity (1/2 width) */}
            <div className="group relative overflow-hidden p-8 md:p-10 rounded-3xl flex flex-col justify-end min-h-[320px] transition-all hover:border-[#00f2ff]/30" style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}>
              {/* Glowing Ambient Top Right */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff] opacity-5 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-10" />
              
              <div className="absolute top-8 right-8 size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: "rgba(0,242,255,0.1)", boxShadow: "0 0 30px rgba(0,242,255,0.3)" }}>
                <span className="material-symbols-outlined text-[#00f2ff]">security</span>
              </div>
              <h3 className="relative z-10 text-2xl font-bold tracking-tight text-white mb-3">Tính toàn vẹn — Không ảo giác</h3>
              <p className="relative z-10 text-[#94a3b8] font-light leading-relaxed">
                Bằng cách neo AI vào Knowledge Graph Neo4j, mọi phản hồi đều được đảm bảo căn cứ từ dữ liệu chính thống.
              </p>
            </div>

            {/* Pillar 2: Graph Logic (1/2 width) */}
            <div className="group relative overflow-hidden p-8 md:p-10 rounded-3xl flex flex-col justify-end min-h-[320px] transition-all hover:border-[#00f2ff]/30" style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              {/* Fake Neural Mesh Pattern Background using existing Canvas inside this scoped div */}
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none scale-125 origin-center mix-blend-screen transition-opacity group-hover:opacity-[0.25]">
                <NeuralMeshBackground />
              </div>
              
              <div className="absolute top-8 right-8 size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: "rgba(0,242,255,0.1)" }}>
                <span className="material-symbols-outlined text-[#00f2ff]">account_tree</span>
              </div>
              <h3 className="relative z-10 text-2xl font-bold tracking-tight text-white mb-3">Minh bạch lập luận</h3>
              <p className="relative z-10 text-[#94a3b8] font-light leading-relaxed">
                Khác với AI &quot;hộp đen&quot;, sứ mệnh của chúng tôi là hiển thị &quot;con đường suy luận&quot; đằng sau mỗi kết luận pháp lý.
              </p>
            </div>

            {/* Pillar 3: User Impact (Full width strip) */}
            <div className="md:col-span-2 group relative overflow-hidden p-8 md:px-12 md:py-10 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6" style={{
              background: "linear-gradient(90deg, rgba(0,242,255,0.06) 0%, rgba(0,200,225,0.02) 100%)",
              border: "1px solid rgba(0,242,255,0.15)",
              boxShadow: "inset 0 0 40px rgba(0,242,255,0.02)"
            }}>
              <div className="shrink-0 size-16 rounded-full flex items-center justify-center transition-transform group-hover:-rotate-12" style={{ background: "rgba(0,242,255,0.15)", border: "1px solid rgba(0,242,255,0.3)" }}>
                <span className="material-symbols-outlined text-[#00f2ff] text-2xl">public</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">Pháp lý cho tất cả mọi người</h3>
                <p className="text-[#94a3b8] font-light leading-relaxed max-w-3xl">
                  Chúng tôi tin rằng sự rõ ràng về pháp luật không phải đặc quyền của số ít. LexMind đơn giản hóa các điều khoản phức tạp thành thông tin dễ hiểu.
                </p>
              </div>
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
              © 2026 LEXMIND INTELLIGENCE SYSTEMS
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
