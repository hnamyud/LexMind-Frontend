"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, HealthResponse, SystemStatsResponse } from "@/lib/adminService";

function StatCard({
    icon,
    label,
    value,
    sub,
    accent = "text-brand",
    badge,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent?: string;
    badge?: React.ReactNode;
}) {
    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 md:p-5 relative overflow-hidden group hover:border-[var(--accent)]/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <span className="text-[var(--text-muted)]">{icon}</span>
                {badge}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${accent}`}>{value}</p>
            {sub && <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-1">{sub}</p>}
        </div>
    );
}

function ServiceDot({ status }: { status: string }) {
    const color = status === "up" ? "bg-green-400" : "bg-red-400";
    return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-2`} />;
}

export default function AdminDashboardPage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [stats, setStats] = useState<SystemStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [h, s] = await Promise.allSettled([
                adminService.getHealth(),
                adminService.getSystemStats(),
            ]);
            if (h.status === "fulfilled") setHealth(h.value);
            if (s.status === "fulfilled") setStats(s.value);
            if (h.status === "rejected" && s.status === "rejected") {
                setError("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
            }
        } catch {
            setError("Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-gray-500 animate-pulse text-sm tracking-widest uppercase font-mono">
                    Đang tải dữ liệu hệ thống...
                </span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Hero Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 md:p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                                Legal Intelligence Hub
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">
                                Giám sát hệ thống LexMind theo thời gian thực.
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="px-5 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 self-start"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới
                        </button>
                    </div>

                    {/* Health Services */}
                    {health && (
                        <div className="mt-6 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg">
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-3">Trạng thái dịch vụ</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Object.entries(health.services).map(([name, svc]) => (
                                    <div key={name} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-primary)]">
                                        <div className="flex items-center">
                                            <ServiceDot status={svc.status} />
                                            <span className="text-xs text-[var(--text-primary)] font-mono capitalize">{name}</span>
                                        </div>
                                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{svc.responseTime}ms</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative bg gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 pointer-events-none" />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400 font-mono">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                            </svg>
                        }
                        label="Người dùng hoạt động"
                        value={stats.activeUsers.last24h.toLocaleString()}
                        sub={`7 ngày: ${stats.activeUsers.last7d.toLocaleString()} · 30 ngày: ${stats.activeUsers.last30d.toLocaleString()}`}
                        accent="text-[var(--text-primary)]"
                        badge={
                            <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
                                24h
                            </span>
                        }
                    />
                    <StatCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        }
                        label="Tin nhắn 24h"
                        value={stats.requestRate.messagesLast24h.toLocaleString()}
                        sub={`TB/ngày: ${stats.requestRate.avgMessagesPerDay}`}
                        accent="text-[var(--accent)]"
                    />
                    <StatCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        label="Tỉ lệ lỗi 24h"
                        value={`${stats.errorRate.last24h.percentage}%`}
                        sub={`${stats.errorRate.last24h.total} lỗi · 7 ngày: ${stats.errorRate.last7d.total} lỗi`}
                        accent={stats.errorRate.last24h.percentage > 5 ? "text-red-400" : "text-green-400"}
                    />
                    <StatCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        label="Thời gian phản hồi TB"
                        value={`${(stats.performance.avgResponseTime / 1000).toFixed(1)}s`}
                        sub={`${stats.performance.slowRequests24h} request chậm (${stats.performance.slowRequestsPercentage}%)`}
                        accent="text-brand"
                    />
                </div>
            )}

            {/* Quick Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Status Summary */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-5">
                    <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono mb-4">Tổng quan hệ thống</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--text-secondary)]">Trạng thái tổng thể</span>
                            <span className={`text-xs font-mono uppercase tracking-widest px-2 py-1 rounded border ${
                                health?.status === "healthy"
                                    ? "text-green-500 bg-green-500/10 border-green-500/20"
                                    : "text-red-500 bg-red-500/10 border-red-500/20"
                            }`}>
                                {health?.status || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--text-secondary)]">Tin nhắn 7 ngày</span>
                            <span className="text-sm text-[var(--text-primary)] font-mono">{stats?.requestRate.messagesLast7d.toLocaleString() || "—"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--text-secondary)]">Người dùng 30 ngày</span>
                            <span className="text-sm text-[var(--text-primary)] font-mono">{stats?.activeUsers.last30d.toLocaleString() || "—"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--text-secondary)]">Request chậm 24h</span>
                            <span className="text-sm text-[var(--accent)] font-mono">{stats?.performance.slowRequests24h ?? "—"}</span>
                        </div>
                    </div>
                </div>

                {/* System Log Placeholder */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--accent-border)] rounded-lg p-5 relative overflow-hidden">
                    <h3 className="text-xs text-[var(--accent)] uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Security Terminal
                    </h3>
                    <div className="space-y-2 font-mono text-[11px]">
                        <div>
                            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString("vi-VN")}</span>{" "}
                            <span className="text-green-500">[SYSTEM]</span>{" "}
                            <span className="text-[var(--text-secondary)]">Health check passed. All services operational.</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString("vi-VN")}</span>{" "}
                            <span className="text-cyan-500">[SYNC]</span>{" "}
                            <span className="text-[var(--text-secondary)]">Database integrity verified.</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString("vi-VN")}</span>{" "}
                            <span className="text-[var(--accent)]">[AI]</span>{" "}
                            <span className="text-[var(--text-secondary)]">Model performance within threshold.</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString("vi-VN")}</span>{" "}
                            <span className="text-[var(--text-muted)]">_</span>
                        </div>
                    </div>
                    {/* Glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
