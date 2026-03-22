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
                    <h1 className="text-xl font-bold text-white tracking-tight">Quản lý người dùng</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Tổng: {total.toLocaleString()} người dùng</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm email hoặc tên..."
                        className="bg-[#0d0d0d] border border-gray-800 text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-orange-500/50 font-mono w-48"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-[#0d0d0d] border border-gray-800 text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-orange-500/50 font-mono"
                    >
                        <option value="">Tất cả role</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-800/60">
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Tên</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Email</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Role</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Hội thoại</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Feedback</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Hoạt động</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-mono animate-pulse">Đang tải...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 font-mono">Không có dữ liệu</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                                        <td className="px-4 py-3 text-gray-300 font-medium">{u.fullName}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                                u.role === "ADMIN" ? "bg-orange-500/20 text-orange-400" : "bg-gray-700/40 text-gray-400"
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">{u.stats?.conversationCount ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">{u.stats?.feedbackCount ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-[10px]">
                                            {u.stats?.lastActiveAt ? new Date(u.stats.lastActiveAt).toLocaleDateString("vi-VN") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetail(u.id)}
                                                className="text-[10px] text-orange-400 hover:text-orange-300 font-mono uppercase tracking-widest transition-colors"
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/60">
                        <span className="text-[10px] text-gray-600 font-mono">Trang {page}/{totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="text-[10px] text-gray-400 hover:text-white font-mono disabled:opacity-30 px-2 py-1 border border-gray-800 rounded transition-colors">
                                ← Trước
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                                className="text-[10px] text-gray-400 hover:text-white font-mono disabled:opacity-30 px-2 py-1 border border-gray-800 rounded transition-colors">
                                Sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                    <div className="w-full max-w-lg bg-[#0d0d0d] border border-gray-800 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                            <h3 className="text-sm font-bold text-white">{selectedUser.fullName}</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {detailLoading ? (
                            <div className="p-8 text-center text-gray-500 font-mono animate-pulse text-xs">Đang tải...</div>
                        ) : (
                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto admin-scroll">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div><span className="text-gray-500">Email: </span><span className="text-gray-300 font-mono">{selectedUser.email}</span></div>
                                    <div><span className="text-gray-500">Role: </span><span className="text-orange-400 font-mono">{selectedUser.role}</span></div>
                                    <div><span className="text-gray-500">Hội thoại: </span><span className="text-white font-mono">{selectedUser.stats?.totalConversations}</span></div>
                                    <div><span className="text-gray-500">Feedbacks: </span><span className="text-white font-mono">{selectedUser.stats?.totalFeedbacks}</span></div>
                                    <div><span className="text-gray-500">Like: </span><span className="text-green-400 font-mono">{selectedUser.stats?.likeFeedbacks}</span></div>
                                    <div><span className="text-gray-500">Dislike: </span><span className="text-red-400 font-mono">{selectedUser.stats?.dislikeFeedbacks}</span></div>
                                    <div><span className="text-gray-500">TB tin/cuộc: </span><span className="text-white font-mono">{selectedUser.stats?.avgMessagesPerConversation}</span></div>
                                </div>
                                {selectedUser.recentConversations && selectedUser.recentConversations.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Hội thoại gần đây</p>
                                        <div className="space-y-2">
                                            {selectedUser.recentConversations.map((c) => (
                                                <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-[#080808] border border-gray-800/40 rounded text-xs">
                                                    <span className="text-gray-300 truncate flex-1">{c.title}</span>
                                                    <span className="text-gray-600 font-mono ml-3 shrink-0">{c.messageCount} tin</span>
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
