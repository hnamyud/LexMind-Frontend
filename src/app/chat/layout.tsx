"use client";

import Sidebar from "@/components/chat/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConversationStore } from "@/store/conversationStore";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);   // mobile
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // desktop
    const router = useRouter();
    const { setActiveId } = useConversationStore();

    const handleNewChat = () => {
        setActiveId(null);
        router.push("/chat");
    };

    return (
        <div className="flex h-screen w-full font-[family-name:var(--font-inter)] antialiased overflow-hidden relative"
            style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
        >
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isExpanded={isSidebarExpanded}
                onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Desktop: no top bar needed (sidebar handles toggle) */}
                {/* Mobile: simplified top bar */}
                <div className="md:hidden flex items-center justify-between p-3 shrink-0"
                    style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-main)" }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center rounded"
                            style={{ backgroundColor: "var(--accent)" }}
                        >
                            <span className="material-symbols-outlined text-[14px]" style={{ color: "#000" }}>gavel</span>
                        </div>
                        <span className="font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>LexMind</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{ color: "var(--text-muted)" }}
                        className="hover:opacity-80 transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                {children}

            </div>
        </div>
    );
}
