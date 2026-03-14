"use client";

import Sidebar from "@/components/chat/Sidebar";
import { useState } from "react";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-main text-gray-200 font-[family-name:var(--font-inter)] antialiased overflow-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header with Hamburger */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-main shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-brand text-black rounded">
                            <span className="material-symbols-outlined text-[14px]">gavel</span>
                        </div>
                        <span className="font-bold tracking-tight text-white">LexMind</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
                
                {children}
            </div>
        </div>
    );
}
