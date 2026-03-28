"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, AdminUser, UserDetailResponse } from "@/lib/adminService";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const limit = 20;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getUsers({
                page, limit,
                search: search || undefined,
                role: roleFilter || undefined,
            });
            setUsers(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleViewDetail = async (userId: string) => {
        setDetailLoading(true);
        try {
            const detail = await adminService.getUserDetail(userId);
            setSelectedUser(detail);
        } catch (err) {
            console.error("Failed to fetch user detail", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Quản lý người dùng</h1>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Tổng: {total.toLocaleString()} người dùng</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm email hoặc tên..."
                        className="bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] pl-8 rounded text-xs px-3 py-2 w-48 focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs px-3 py-2 rounded focus:outline-none focus:border-[var(--accent)] font-mono"
                    >
                        <option value="">Tất cả role</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {/* Table */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Tên</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Email</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Role</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Hội thoại</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Feedback</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Hoạt động</th>
                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)] font-mono animate-pulse">Đang tải...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)] font-mono">Không có dữ liệu</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{u.fullName}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                                u.role === "ADMIN" ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]" : "bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-primary)]"
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{u.stats?.conversationCount ?? 0}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{u.stats?.feedbackCount ?? 0}</td>
                                        <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[10px]">
                                            {u.stats?.lastActiveAt ? new Date(u.stats.lastActiveAt).toLocaleDateString("vi-VN") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetail(u.id)}
                                                className="text-[10px] text-[var(--accent)] hover:opacity-80 font-mono uppercase tracking-widest transition-opacity"
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                    <div className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-[var(--shadow-bubble)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedUser.fullName}</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {detailLoading ? (
                            <div className="p-8 text-center text-[var(--text-muted)] font-mono animate-pulse text-xs">Đang tải...</div>
                        ) : (
                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto admin-scroll">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div><span className="text-[var(--text-muted)]">Email: </span><span className="text-[var(--text-primary)] font-mono">{selectedUser.email}</span></div>
                                    <div><span className="text-[var(--text-muted)]">Role: </span><span className="text-[var(--accent)] font-mono">{selectedUser.role}</span></div>
                                    <div><span className="text-[var(--text-muted)]">Hội thoại: </span><span className="text-[var(--text-primary)] font-mono">{selectedUser.stats?.totalConversations}</span></div>
                                    <div><span className="text-[var(--text-muted)]">Feedbacks: </span><span className="text-[var(--text-primary)] font-mono">{selectedUser.stats?.totalFeedbacks}</span></div>
                                    <div><span className="text-[var(--text-muted)]">Like: </span><span className="text-green-500 font-mono">{selectedUser.stats?.likeFeedbacks}</span></div>
                                    <div><span className="text-[var(--text-muted)]">Dislike: </span><span className="text-red-500 font-mono">{selectedUser.stats?.dislikeFeedbacks}</span></div>
                                    <div><span className="text-[var(--text-muted)]">TB tin/cuộc: </span><span className="text-[var(--text-primary)] font-mono">{selectedUser.stats?.avgMessagesPerConversation}</span></div>
                                </div>
                                {selectedUser.recentConversations && selectedUser.recentConversations.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-2">Hội thoại gần đây</p>
                                        <div className="space-y-2">
                                            {selectedUser.recentConversations.map((c) => (
                                                <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-xs">
                                                    <span className="text-[var(--text-primary)] truncate flex-1">{c.title}</span>
                                                    <span className="text-[var(--text-muted)] font-mono ml-3 shrink-0">{c.messageCount} tin</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
