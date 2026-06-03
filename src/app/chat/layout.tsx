"use client";

import Sidebar from "@/components/chat/Sidebar";
import { useState } from "react";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);   // mobile
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // desktop

    return (
        <div className="app-shell relative flex h-screen w-full overflow-hidden font-[family-name:var(--font-inter)] antialiased">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isExpanded={isSidebarExpanded}
                onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
            />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
                <div className="md:hidden flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        </div>
                        <span className="font-semibold tracking-tight text-[var(--text-primary)]">LexMind</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
