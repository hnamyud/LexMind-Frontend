"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useEffect, useRef, useState, useCallback } from "react";

interface SidebarProps {
    isOpen?: boolean;       // mobile overlay open state
    onClose?: () => void;   // mobile close callback
    isExpanded: boolean;    // desktop expanded state
    onToggleExpand: () => void;
}

export default function Sidebar({ isOpen = false, onClose, isExpanded, onToggleExpand }: SidebarProps) {
    const router = useRouter();
    const { user, accessToken, logout, fetchProfile, isLoading: authLoading } = useAuthStore();
    const {
        conversations,
        activeId,
        isLoading: convLoading,
        hasMore,
        fetchConversations,
        loadMore,
        setActiveId,
        updateConversation,
        deleteConversation,
    } = useConversationStore();

    const [popoverOpen, setPopoverOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);

    const [ctxMenu, setCtxMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const ctxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (accessToken && !user) fetchProfile();
    }, [accessToken, user, fetchProfile]);

    useEffect(() => {
        if (accessToken) fetchConversations(1);
    }, [accessToken, fetchConversations]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopoverOpen(false);
            }
            if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
                setCtxMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (onClose && isOpen) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleLogout = async () => {
        setPopoverOpen(false);
        await logout();
        router.push("/login");
    };

    const handleNewChat = () => {
        setActiveId(null);
        router.push("/chat");
    };

    const handleSelectConversation = (id: string) => {
        setActiveId(id);
        setCtxMenu(null);
        router.push(`/chat?conversationId=${id}`);
    };

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setCtxMenu({ id, x: e.clientX, y: e.clientY });
    };

    const startRename = (id: string, currentTitle: string) => {
        setCtxMenu(null);
        setEditingId(id);
        setEditingTitle(currentTitle);
    };

    const commitRename = useCallback(async () => {
        if (!editingId) return;
        const trimmed = editingTitle.trim();
        if (trimmed) await updateConversation(editingId, { title: trimmed });
        setEditingId(null);
        setEditingTitle("");
    }, [editingId, editingTitle, updateConversation]);

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") commitRename();
        if (e.key === "Escape") { setEditingId(null); setEditingTitle(""); }
    };

    const handleDelete = async (id: string) => {
        setCtxMenu(null);
        await deleteConversation(id);
        if (id === activeId) {
            setActiveId(null);
            router.push("/chat");
        }
    };

    const isAuthenticated = !!accessToken;
    // Mobile sidebar is always "expanded" (it's a full-width overlay)
    const showFull = isExpanded || isOpen;
    const grouped = groupByDate(conversations);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <nav
                className={`
                    bg-sidebar border-r border-gray-800 flex flex-col h-full shrink-0
                    fixed md:relative z-50
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? "w-64" : "w-16 md:w-16"}
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* ─── Header: Logo + Toggle ─── */}
                <div className={`flex items-center h-16 shrink-0 border-b border-gray-800/60 ${showFull ? "px-4 justify-between" : "px-0 justify-center"}`}>
                    {/* Logo icon — clicking toggles expand on desktop */}
                    <button
                        onClick={onToggleExpand}
                        className="hidden md:flex w-9 h-9 items-center justify-center bg-brand text-black rounded hover:opacity-90 transition-all duration-200 shrink-0"
                        title={isExpanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                    </button>

                    {/* LexMind text + mobile close — only when expanded */}
                    {showFull && (
                        <div className="flex items-center justify-between flex-1 ml-3">
                            <Link href="/" className="text-lg font-bold tracking-tight text-white">
                                LexMind
                            </Link>
                            {/* Close button for mobile */}
                            {onClose && (
                                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Mobile: always show logo icon */}
                    <div className="md:hidden flex w-9 h-9 items-center justify-center bg-brand text-black rounded shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                    </div>
                </div>

                {/* ─── New Chat Button ─── */}
                <div className={`py-3 ${showFull ? "px-3" : "px-2"}`}>
                    <button
                        onClick={handleNewChat}
                        title="Cuộc hội thoại mới"
                        className={`flex items-center text-sm font-medium text-white bg-gray-800 rounded transition-all duration-200 hover:bg-gray-700 ${showFull ? "w-full gap-3 px-3 py-2" : "w-full justify-center py-2.5"}`}
                    >
                        <svg className="h-5 w-5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        {showFull && <span>New Chat</span>}
                    </button>
                </div>

                {/* ─── Conversation List ─── */}
                <div className={`flex-1 overflow-y-auto pb-2 ${showFull ? "px-3 space-y-4" : "px-2"}`}>
                    {showFull && (
                        // Expanded: full list
                        convLoading && conversations.length === 0 ? (
                            <div className="space-y-2 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-7 rounded bg-gray-800/60 animate-pulse" />
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-xs text-gray-600 text-center mt-8 px-2">
                                Chưa có cuộc hội thoại nào.
                            </p>
                        ) : (
                            grouped.map(({ label, items }) => (
                                <div key={label}>
                                    <div className="pt-4 pb-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                        {label}
                                    </div>
                                    <div className="space-y-0.5">
                                        {items.map((conv) => (
                                            <div
                                                key={conv.id}
                                                className={`group relative flex items-center rounded transition-all ${activeId === conv.id ? "bg-gray-700" : "hover:bg-gray-800/70"}`}
                                                onContextMenu={(e) => handleContextMenu(e, conv.id)}
                                            >
                                                {editingId === conv.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onBlur={commitRename}
                                                        onKeyDown={handleRenameKeyDown}
                                                        className="flex-1 px-3 py-2 text-xs bg-gray-900 text-gray-200 border border-brand/50 rounded outline-none"
                                                    />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleSelectConversation(conv.id)}
                                                            className="flex-1 min-w-0 text-left px-3 py-2 text-xs text-gray-400 group-hover:text-gray-200 truncate"
                                                            title={conv.title}
                                                        >
                                                            {conv.title || "Cuộc hội thoại chưa đặt tên"}
                                                        </button>
                                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1.5 shrink-0 transition-opacity">
                                                            <button
                                                                onClick={() => startRename(conv.id, conv.title)}
                                                                className="p-1 text-gray-600 hover:text-gray-300 rounded transition-colors"
                                                                title="Đổi tên"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(conv.id)}
                                                                className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {/* Load More */}
                    {showFull && hasMore && !convLoading && (
                        <button onClick={loadMore} className="w-full text-[10px] text-gray-600 hover:text-gray-400 py-2 transition-colors">
                            Tải thêm...
                        </button>
                    )}
                    {showFull && convLoading && conversations.length > 0 && (
                        <div className="text-center py-2">
                            <span className="text-[10px] text-gray-600 animate-pulse">Đang tải...</span>
                        </div>
                    )}
                </div>

                {/* ─── Auth Section ─── */}
                <div className={`border-t border-gray-800 shrink-0 ${showFull ? "p-3" : "p-2"}`}>
                    {isAuthenticated && user ? (
                        <div ref={popoverRef} className="relative">
                            {popoverOpen && showFull && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a1a] border border-gray-700 rounded shadow-xl shadow-black/50 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-800">
                                        <p className="text-xs font-semibold text-gray-200 truncate">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <button
                                        id="logout-btn"
                                        onClick={handleLogout}
                                        disabled={authLoading}
                                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        </svg>
                                        {authLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                                    </button>
                                </div>
                            )}
                            <button
                                id="avatar-btn"
                                onClick={() => showFull ? setPopoverOpen((prev) => !prev) : handleLogout()}
                                title={showFull ? "" : `${user.name} — Đăng xuất`}
                                className={`w-full flex items-center rounded transition-colors cursor-pointer select-none ${showFull ? "gap-2 px-3 py-2" : "justify-center py-2"} ${popoverOpen ? "bg-gray-700" : "bg-gray-800/60 hover:bg-gray-700/70"}`}
                            >
                                <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-xs font-bold text-brand uppercase shrink-0">
                                    {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                                </div>
                                {showFull && (
                                    <>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs font-semibold text-gray-200 truncate">{user.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <svg
                                            className={`w-3 h-3 text-gray-500 shrink-0 transition-transform duration-200 ${popoverOpen ? "rotate-180" : ""}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            id="sidebar-login-link"
                            title="Đăng nhập"
                            className={`flex items-center text-sm text-gray-400 hover:text-white transition-all ${showFull ? "px-3 py-2 gap-2" : "justify-center py-2"}`}
                        >
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                            {showFull && <span>Đăng nhập</span>}
                        </Link>
                    )}
                </div>
            </nav>

            {/* Context Menu (right-click) */}
            {ctxMenu && (
                <div
                    ref={ctxRef}
                    className="fixed z-[999] bg-[#1e1e1e] border border-gray-700 rounded shadow-xl shadow-black/60 py-1 min-w-[140px]"
                    style={{ top: ctxMenu.y, left: ctxMenu.x }}
                >
                    <button
                        onClick={() => {
                            const conv = conversations.find((c) => c.id === ctxMenu.id);
                            if (conv) startRename(conv.id, conv.title);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Đổi tên
                    </button>
                    <button
                        onClick={() => handleDelete(ctxMenu.id)}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa hội thoại
                    </button>
                </div>
            )}
        </>
    );
}

// ─── Helper: group conversations by date ─────────────────────────────────────
function groupByDate(conversations: import("@/lib/conversationService").Conversation[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7 = new Date(today.getTime() - 7 * 86400000);
    const last30 = new Date(today.getTime() - 30 * 86400000);

    const groups: Record<string, typeof conversations> = {
        "Hôm nay": [],
        "Hôm qua": [],
        "7 ngày qua": [],
        "30 ngày qua": [],
        "Cũ hơn": [],
    };

    for (const conv of conversations) {
        const d = new Date(conv.updatedAt ?? conv.createdAt);
        if (d >= today) groups["Hôm nay"].push(conv);
        else if (d >= yesterday) groups["Hôm qua"].push(conv);
        else if (d >= last7) groups["7 ngày qua"].push(conv);
        else if (d >= last30) groups["30 ngày qua"].push(conv);
        else groups["Cũ hơn"].push(conv);
    }

    return Object.entries(groups)
        .filter(([, items]) => items.length > 0)
        .map(([label, items]) => ({ label, items }));
}
