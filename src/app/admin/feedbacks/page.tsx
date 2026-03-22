"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, FeedbackItem, FeedbackAnalyticsResponse } from "@/lib/adminService";

export default function AdminFeedbacksPage() {
    const [analytics, setAnalytics] = useState<FeedbackAnalyticsResponse | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [likeFilter, setLikeFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const limit = 20;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [analyticsRes, feedbacksRes] = await Promise.allSettled([
                adminService.getFeedbackAnalytics(),
                adminService.getFeedbacks({
                    page, limit,
                    isLike: likeFilter === "" ? undefined : likeFilter === "true",
                    search: search || undefined,
                }),
            ]);
            if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
            if (feedbacksRes.status === "fulfilled") {
                setFeedbacks(feedbacksRes.value.data || []);
                setTotal(feedbacksRes.value.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch feedbacks", err);
        } finally {
            setLoading(false);
        }
    }, [page, likeFilter, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Phân tích phản hồi</h1>
                <p className="text-xs text-gray-500 font-mono mt-1">Đánh giá chất lượng câu trả lời AI</p>
            </div>

            {/* Analytics Overview */}
            {analytics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Tổng feedback</p>
                        <p className="text-2xl font-bold text-white">{analytics.overview.totalFeedbacks}</p>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Like</p>
                        <p className="text-2xl font-bold text-green-400">{analytics.overview.likeCount}</p>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Dislike</p>
                        <p className="text-2xl font-bold text-red-400">{analytics.overview.dislikeCount}</p>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Tỉ lệ Like</p>
                        <p className="text-2xl font-bold text-orange-400">{(analytics.overview.likeRatio * 100).toFixed(0)}%</p>
                        <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-brand rounded-full transition-all" style={{ width: `${analytics.overview.likeRatio * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Điểm chất lượng</p>
                        <p className="text-2xl font-bold text-brand">{analytics.overview.qualityScore}</p>
                    </div>
                </div>
            )}

            {/* Dislike Reasons */}
            {analytics?.dislikeReasons && analytics.dislikeReasons.length > 0 && (
                <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-5">
                    <h3 className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-4">Lý do Dislike phổ biến</h3>
                    <div className="space-y-2">
                        {analytics.dislikeReasons.map((r, i) => {
                            const maxCount = analytics.dislikeReasons[0].count;
                            const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-300 w-1/3 truncate">{r.reason}</span>
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono w-8 text-right">{r.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Tìm theo lý do dislike..."
                    className="bg-[#0d0d0d] border border-gray-800 text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-orange-500/50 font-mono w-56"
                />
                <select
                    value={likeFilter}
                    onChange={(e) => { setLikeFilter(e.target.value); setPage(1); }}
                    className="bg-[#0d0d0d] border border-gray-800 text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-orange-500/50 font-mono"
                >
                    <option value="">Tất cả</option>
                    <option value="true">Like</option>
                    <option value="false">Dislike</option>
                </select>
            </div>

            {/* Feedbacks Table */}
            <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-800/60">
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Người dùng</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Câu hỏi</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Loại</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Lý do</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Model</th>
                                <th className="px-4 py-3 text-left text-gray-500 font-mono uppercase tracking-widest">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-mono animate-pulse">Đang tải...</td></tr>
                            ) : feedbacks.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600 font-mono">Không có dữ liệu</td></tr>
                            ) : (
                                feedbacks.map((f) => (
                                    <tr key={f.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                                        <td className="px-4 py-3 text-gray-300">{f.user?.fullName || "—"}</td>
                                        <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{f.message?.question || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${f.isLike ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                {f.isLike ? "LIKE" : "DISLIKE"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{f.reason || "—"}</td>
                                        <td className="px-4 py-3 text-orange-400 font-mono text-[10px]">{f.message?.aiMetrics?.model || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-[10px]">{new Date(f.createdAt).toLocaleDateString("vi-VN")}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
        </div>
    );
}
