"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{ backgroundColor: "#050505", color: "#f1f5f9" }}
      className="min-h-screen font-[family-name:var(--font-public-sans)] selection:bg-[#00f2ff33]"
    >
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 star-field pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 comet-trail pointer-events-none"></div>
        <div
          className="absolute bottom-1/3 right-1/4 comet-trail pointer-events-none"
          style={{ width: 300, opacity: 0.5 }}
        ></div>

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
            <Link
              className="text-sm font-medium tracking-widest uppercase transition-colors"
              style={{ color: "#94a3b8" }}
              href="/login"
            >
              Login
            </Link>
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
            <div
              className="relative rounded-xl p-2 overflow-hidden shadow-2xl"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(18,18,18,0.4)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,242,255,0.05), transparent)",
                }}
              ></div>
              {/* Window controls */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  ></div>
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  ></div>
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  ></div>
                </div>
                <div
                  className="flex-1 text-center text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: "#64748b" }}
                >
                  LexMind Terminal v1.0.4
                </div>
              </div>
              {/* Terminal Body */}
              <div
                className="aspect-video rounded-b-lg flex flex-col p-6 text-left"
                style={{ backgroundColor: "rgba(5,5,5,0.8)" }}
              >
                <div className="flex gap-4 mb-6">
                  <div
                    className="size-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,242,255,0.2)" }}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: "#00f2ff" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 rounded w-3/4"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    ></div>
                    <div
                      className="h-4 rounded w-1/2"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-4 self-end w-2/3 mb-6">
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 rounded w-full"
                      style={{ backgroundColor: "rgba(0,242,255,0.1)" }}
                    ></div>
                  </div>
                  <div
                    className="size-8 rounded"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  ></div>
                </div>
                <div
                  className="mt-auto pt-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "rgba(0,242,255,0.6)" }}
                  >
                    ANALYZING PRECEDENT... [98%]
                  </span>
                  <div className="flex gap-2">
                    <div
                      className="h-2 w-12 rounded"
                      style={{ backgroundColor: "rgba(0,242,255,0.2)" }}
                    ></div>
                    <div
                      className="h-2 w-8 rounded"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
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
                Advanced Research
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Deep-dive into global legal precedents with sub-second latency
                and semantic context.
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
                Sovereign Privacy
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Military-grade encryption for every query. Your data never
                trains the public model.
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
                Drafting Engine
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "#94a3b8" }}>
                Generate complex filings and contracts with professional
                precision and tone control.
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
