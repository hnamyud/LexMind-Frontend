"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useTheme } from "@/providers/ThemeProvider";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded: boolean;
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
  const { theme, toggleTheme } = useTheme();

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
    if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const handleDelete = async (id: string) => {
    setCtxMenu(null);
    await deleteConversation(id);
    if (id === activeId) {
      setActiveId(null);
      router.push("/chat");
    }
  };

  const showFull = isExpanded || isOpen;
  const grouped = groupByDate(conversations);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <nav
        className={`fixed z-50 flex h-full shrink-0 flex-col transition-all duration-300 ease-in-out md:relative ${
          showFull ? "w-72" : "w-20"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{
          background: "color-mix(in srgb, var(--bg-sidebar) 86%, transparent)",
          borderRight: "1px solid var(--border-primary)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          className={`flex h-16 shrink-0 items-center overflow-hidden ${
            showFull ? "gap-3 px-4" : "justify-center px-0"
          }`}
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={onToggleExpand}
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-border)] md:flex"
            title={isExpanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          >
            <span className="material-symbols-outlined text-[18px]">{isExpanded ? "left_panel_close" : "left_panel_open"}</span>
          </button>

          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] md:hidden">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>

          {showFull && (
            <>
              <Link href="/" className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                LexMind
              </Link>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] md:hidden"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </>
          )}
        </div>

        <div className={`py-3 ${showFull ? "px-3" : "px-2"}`}>
          <button
            onClick={handleNewChat}
            title="Cuộc hội thoại mới"
            className={`md3-pill flex items-center text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-container-high)] ${
              showFull ? "w-full gap-3 px-4 py-3" : "w-full justify-center py-3"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[var(--accent)]">add</span>
            {showFull && <span>Cuộc trò chuyện mới</span>}
          </button>
        </div>

        <div className={`sidebar-scroll flex-1 overflow-y-auto pb-2 ${showFull ? "space-y-4 px-3" : "px-2"}`}>
          {showFull &&
            (convLoading && conversations.length === 0 ? (
              <div className="mt-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-2xl bg-[var(--bg-hover)]" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="mt-8 px-2 text-center text-xs text-[var(--text-faint)]">Chưa có cuộc hội thoại nào.</p>
            ) : (
              grouped.map(({ label, items }) => (
                <div key={label}>
                  <div className="pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    {label}
                  </div>
                  <div className="space-y-1">
                    {items.map((conv) => (
                      <div
                        key={conv.id}
                        className="group relative flex items-center rounded-[18px] transition-colors"
                        style={{
                          backgroundColor: activeId === conv.id ? "var(--surface-container-high)" : undefined,
                        }}
                        onContextMenu={(e) => handleContextMenu(e, conv.id)}
                      >
                        {editingId === conv.id ? (
                          <input
                            ref={editInputRef}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={handleRenameKeyDown}
                            className="flex-1 rounded-2xl border border-[var(--accent-border)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                          />
                        ) : (
                          <>
                            <button
                              onClick={() => handleSelectConversation(conv.id)}
                              className="flex-1 min-w-0 px-3 py-2.5 text-left text-xs leading-snug text-[var(--text-muted)] line-clamp-2"
                              style={{ color: activeId === conv.id ? "var(--text-primary)" : "var(--text-muted)" }}
                              title={conv.title}
                            >
                              {conv.title || "Cuộc hội thoại chưa đặt tên"}
                            </button>
                            <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => startRename(conv.id, conv.title)}
                                className="rounded-full p-1 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                title="Đổi tên"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(conv.id)}
                                className="rounded-full p-1 text-[var(--danger)] opacity-70 transition-colors hover:bg-[var(--danger-soft)] hover:opacity-100"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ))}

          {showFull && hasMore && !convLoading && (
            <button onClick={loadMore} className="w-full py-2 text-[10px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-primary)]">
              Tải thêm...
            </button>
          )}
          {showFull && convLoading && conversations.length > 0 && (
            <div className="py-2 text-center">
              <span className="text-[10px] text-[var(--text-faint)] animate-pulse">Đang tải...</span>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--border-primary)]">
          <div className={showFull ? "px-3 pb-1 pt-3" : "p-2"}>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
              className={`flex items-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] ${
                showFull ? "w-full gap-3 px-3 py-2" : "w-full justify-center py-2"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
              {showFull && <span className="text-xs">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>
          </div>

          <div className={showFull ? "p-3 pt-1" : "p-2"}>
            {accessToken && user ? (
              <div ref={popoverRef} className="relative">
                {popoverOpen && showFull && (
                  <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-[var(--shadow-panel)]">
                    <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                      <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{user.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--text-faint)]">{user.email}</p>
                    </div>
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      {authLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                    </button>
                  </div>
                )}

                <button
                  id="avatar-btn"
                  onClick={() => (showFull ? setPopoverOpen((prev) => !prev) : onToggleExpand())}
                  title={showFull ? "" : user.name}
                  className={`w-full cursor-pointer select-none items-center rounded-full transition-colors hover:bg-[var(--bg-hover)] ${
                    showFull ? "flex gap-2 px-3 py-2" : "flex justify-center py-2"
                  }`}
                  style={{ backgroundColor: popoverOpen ? "var(--bg-hover)" : undefined }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-xs font-bold uppercase text-[var(--accent)]">
                    {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                  </div>
                  {showFull && (
                    <>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{user.name}</p>
                        <p className="truncate text-[10px] text-[var(--text-faint)]">{user.email}</p>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] text-[var(--text-muted)] transition-transform ${popoverOpen ? "rotate-180" : ""}`}>
                        keyboard_arrow_up
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                id="sidebar-login-link"
                title="Đăng nhập"
                className={`flex items-center text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] ${
                  showFull ? "gap-2 rounded-full px-3 py-2" : "justify-center py-2"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                {showFull && <span>Đăng nhập</span>}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {ctxMenu && (
        <div
          ref={ctxRef}
          className="fixed z-[999] min-w-[160px] rounded-[20px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] py-1 shadow-[var(--shadow-panel)]"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          <button
            onClick={() => {
              const conv = conversations.find((c) => c.id === ctxMenu.id);
              if (conv) startRename(conv.id, conv.title);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Đổi tên
          </button>
          <button
            onClick={() => handleDelete(ctxMenu.id)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Xóa hội thoại
          </button>
        </div>
      )}
    </>
  );
}

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

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt ?? a.createdAt).getTime();
    const timeB = new Date(b.updatedAt ?? b.createdAt).getTime();
    return timeB - timeA;
  });

  for (const conv of sortedConversations) {
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
