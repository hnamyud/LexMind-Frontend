"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, AdminConversation, ConversationDetailResponse } from "@/lib/adminService";

export default function AdminConversationsPage() {
    const [conversations, setConversations] = useState<AdminConversation[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [negativeOnly, setNegativeOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<ConversationDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const limit = 20;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getConversations({
                page, limit,
                hasNegativeFeedback: negativeOnly || undefined,
            });
            setConversations(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoading(false);
        }
    }, [page, negativeOnly]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleViewDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const d = await adminService.getConversationDetail(id);
            setDetail(d);
        } catch (err) {
            console.error("Failed to fetch conversation detail", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Quản lý hội thoại</h1>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Tổng: {total.toLocaleString()} hội thoại</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-muted)]">
                    <input
                        type="checkbox"
                        checked={negativeOnly}
                        onChange={(e) => { setNegativeOnly(e.target.checked); setPage(1); }}
                        className="accent-[var(--accent)]"
                    />
                    <span className="font-mono">Chỉ hiện dislike</span>
                </label>
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Tiêu đề</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Người dùng</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Tin nhắn</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">TB Phản hồi</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Dislike</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Ngày tạo</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)] font-mono animate-pulse">Đang tải...</td></tr>
                            ) : conversations.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)] font-mono">Không có dữ liệu</td></tr>
                            ) : (
                                conversations.map((c) => (
                                    <tr key={c.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium truncate max-w-[200px]">{c.title || "Không tiêu đề"}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.user?.fullName || "—"}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{c.messageCount}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{c.avgResponseTime ? `${(c.avgResponseTime / 1000).toFixed(1)}s` : "—"}</td>
                                        <td className="px-4 py-3">
                                            {c.hasNegativeFeedback && (
                                                <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">Có</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[10px]">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleViewDetail(c.id)}
                                                className="text-[10px] text-[var(--accent)] hover:opacity-80 font-mono uppercase tracking-widest transition-opacity">
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">Trang {page}/{totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-mono disabled:opacity-30 px-2 py-1 border border-[var(--border-primary)] rounded transition-colors bg-[var(--bg-secondary)]">
                                ← Trước
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                                className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-mono disabled:opacity-30 px-2 py-1 border border-[var(--border-primary)] rounded transition-colors bg-[var(--bg-secondary)]">
                                Sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Conversation Detail Modal */}
            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)}>
                    <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-[var(--shadow-bubble)] overflow-hidden max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)] shrink-0 bg-[var(--bg-primary)]">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{detail.title || "Hội thoại"}</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{detail.user?.email}</p>
                            </div>
                            <button onClick={() => setDetail(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Stats row */}
                        {detail.stats && (
                            <div className="grid grid-cols-3 gap-3 px-5 py-3 border-b border-[var(--border-primary)] shrink-0 bg-[var(--bg-secondary)]">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-[var(--text-primary)]">{detail.stats.totalMessages}</p>
                                    <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase">Tin nhắn</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-[var(--accent)]">{(detail.stats.avgResponseTime / 1000).toFixed(1)}s</p>
                                    <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase">TB phản hồi</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-green-500">{detail.stats.likeFeedbacks}</p>
                                    <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase">Like</p>
                                </div>
                            </div>
                        )}

                        {detailLoading ? (
                            <div className="p-8 text-center text-[var(--text-muted)] font-mono text-xs animate-pulse">Đang tải...</div>
                        ) : (
                            <div className="flex-1 overflow-y-auto chat-stream p-5 space-y-4 bg-[var(--bg-main)]">
                                {detail.messages?.map((m) => (
                                    <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-bubble)] ${
                                            m.sender === "user"
                                                ? "bg-[var(--bg-bubble-user)] text-[var(--text-primary)] rounded-2xl rounded-tr-sm"
                                                : "bg-[var(--bg-bubble-ai)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm border border-[var(--border-primary)]"
                                        }`}>
                                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                            <div className={`flex items-center gap-2 mt-1.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                <span className="text-[10px] text-[var(--text-muted)] font-mono">{new Date(m.createdAt).toLocaleTimeString("vi-VN")}</span>
                                                {m.aiMetrics && <span className="text-[10px] text-[var(--text-muted)] font-mono">{m.aiMetrics.totalTime}ms</span>}
                                                {m.feedback && (
                                                    <span className={`text-[10px] font-mono ${m.feedback.isLike ? "text-green-500" : "text-red-500"}`}>
                                                        {m.feedback.isLike ? "👍" : "👎"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
