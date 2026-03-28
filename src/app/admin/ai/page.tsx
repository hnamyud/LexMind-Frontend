"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, AIPerformanceResponse, AIErrorsResponse, AICacheResponse } from "@/lib/adminService";

function MetricCard({
    label,
    value,
    sub,
    accent = "text-[var(--text-primary)]",
}: {
    label: string;
    value: string;
    sub?: string;
    accent?: string;
}) {
    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1">{label}</p>
            <p className={`text-xl font-bold ${accent}`}>{value}</p>
            {sub && <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-1">{sub}</p>}
        </div>
    );
}

/** Mini bar comparing two ms values visually */
function ResponseTimeBar({
    cachedMs,
    nonCachedMs,
    label,
}: {
    cachedMs: number;
    nonCachedMs: number;
    label: string;
}) {
    const max = nonCachedMs;
    const cachedPct = Math.round((cachedMs / max) * 100);
    return (
        <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">{label}</p>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${cachedPct}%` }}
                    />
                </div>
                <span className="text-[10px] text-emerald-500 font-mono w-16 text-right">{cachedMs}ms</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: "100%" }} />
                </div>
                <span className="text-[10px] text-[var(--accent)] font-mono w-16 text-right">{nonCachedMs}ms</span>
            </div>
        </div>
    );
}

export default function AdminAIPage() {
    const [perf, setPerf] = useState<AIPerformanceResponse | null>(null);
    const [errors, setErrors] = useState<AIErrorsResponse | null>(null);
    const [cache, setCache] = useState<AICacheResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, e, c] = await Promise.allSettled([
                adminService.getAIPerformance(),
                adminService.getAIErrors({ limit: 20 }),
                adminService.getAICache(),
            ]);
            if (p.status === "fulfilled") setPerf(p.value);
            if (e.status === "fulfilled") setErrors(e.value);
            if (c.status === "fulfilled") setCache(c.value);
        } catch (err) {
            console.error("Failed to fetch AI data", err);
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
                    Đang tải dữ liệu AI...
                </span>
            </div>
        );
    }

    // Derive hit-rate ring degree for the donut
    const hitPct = cache?.overview.hitRatePercent ?? 0;
    const ringDeg = Math.round((hitPct / 100) * 360);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Hiệu suất AI</h1>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Metrics kỹ thuật, semantic cache & theo dõi lỗi</p>
                </div>
                <button
                    onClick={fetchData}
                    className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono uppercase tracking-widest px-3 py-1.5 border border-[var(--border-primary)] rounded transition-colors bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
                >
                    Làm mới
                </button>
            </div>

            {/* ─── Performance Overview ─────────────────────────────────────────── */}
            {perf && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <MetricCard label="TB Response Time" value={`${(perf.overview.avgResponseTime / 1000).toFixed(1)}s`} accent="text-[var(--accent)]" />
                        <MetricCard label="P50" value={`${(perf.overview.p50ResponseTime / 1000).toFixed(1)}s`} />
                        <MetricCard label="P95" value={`${(perf.overview.p95ResponseTime / 1000).toFixed(1)}s`} accent="text-yellow-500" />
                        <MetricCard label="P99" value={`${(perf.overview.p99ResponseTime / 1000).toFixed(1)}s`} accent="text-red-500" />
                        <MetricCard label="TTFT (TB)" value={`${perf.overview.avgTTFT}ms`} accent="text-brand" />
                        <MetricCard label="Tổng chi phí" value={`$${perf.overview.totalCost.toFixed(2)}`} accent="text-green-500" />
                        <MetricCard label="Chi phí/tin" value={`$${perf.overview.avgCostPerMessage.toFixed(4)}`} />
                    </div>

                    {/* Model Distribution */}
                    {perf.modelDistribution && perf.modelDistribution.length > 0 && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-5">
                            <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono mb-4">Phân bổ Model</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Model</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Số lượng</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">TB Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {perf.modelDistribution.map((m) => (
                                            <tr key={m.model} className="border-b border-[var(--border-subtle)]">
                                                <td className="px-4 py-2 text-[var(--accent)] font-mono">{m.model}</td>
                                                <td className="px-4 py-2 text-[var(--text-primary)] font-mono">{m.count.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-[var(--text-secondary)] font-mono">{(m.avgTime / 1000).toFixed(1)}s</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Token Usage */}
                    {perf.tokenUsage && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <MetricCard label="Input Tokens" value={perf.tokenUsage.totalInputTokens.toLocaleString()} accent="text-brand" />
                            <MetricCard label="Output Tokens" value={perf.tokenUsage.totalOutputTokens.toLocaleString()} accent="text-[var(--accent)]" />
                            <MetricCard label="TB Input/tin" value={perf.tokenUsage.avgInputTokensPerMessage.toLocaleString()} />
                        </div>
                    )}
                </>
            )}

            {/* ─── Semantic Cache Analytics ─────────────────────────────────────── */}
            {cache && (
                <div className="space-y-4">
                    {/* Section heading */}
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-[var(--border-primary)]" />
                        <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Semantic Cache
                        </span>
                        <div className="h-px flex-1 bg-[var(--border-primary)]" />
                    </div>

                    {/* Overview row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Donut / hit-rate visual */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                            {/* CSS conic-gradient donut */}
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center"
                                style={{
                                    background: `conic-gradient(#10b981 0deg ${ringDeg}deg, var(--bg-hover) ${ringDeg}deg 360deg)`,
                                }}
                            >
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                    <span className="text-sm font-bold text-emerald-500">{hitPct.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">Cache Hit Rate</p>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">Hit {cache.overview.cacheHits.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">Miss {cache.overview.cacheMisses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <MetricCard
                                label="Tổng queries"
                                value={cache.overview.totalQueries.toLocaleString()}
                            />
                            <MetricCard
                                label="Cache Hits"
                                value={cache.overview.cacheHits.toLocaleString()}
                                accent="text-emerald-400"
                            />
                            <MetricCard
                                label="Cache Misses"
                                value={cache.overview.cacheMisses.toLocaleString()}
                                accent="text-gray-400"
                            />
                            <MetricCard
                                label="TB Time Saved"
                                value={`${(cache.overview.avgTimeSavedMs / 1000).toFixed(1)}s`}
                                accent="text-emerald-400"
                                sub="mỗi cache hit"
                            />
                            <MetricCard
                                label="Tổng Time Saved"
                                value={`${(cache.overview.totalTimeSavedMs / 1000 / 60).toFixed(1)} phút`}
                                accent="text-emerald-500"
                                sub={`${(cache.overview.totalTimeSavedMs / 1000).toFixed(0)}s tổng cộng`}
                            />
                        </div>
                    </div>

                    {/* Response Time Comparison */}
                    {cache.responseTimeComparison && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">
                                    So sánh Response Time
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] font-mono">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                        <span className="text-emerald-500">Cached</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
                                        <span className="text-[var(--accent)]">Non-cached</span>
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <ResponseTimeBar
                                    label="AVG"
                                    cachedMs={cache.responseTimeComparison.cached.avg}
                                    nonCachedMs={cache.responseTimeComparison.nonCached.avg}
                                />
                                <ResponseTimeBar
                                    label="P50"
                                    cachedMs={cache.responseTimeComparison.cached.p50}
                                    nonCachedMs={cache.responseTimeComparison.nonCached.p50}
                                />
                                <ResponseTimeBar
                                    label="P95"
                                    cachedMs={cache.responseTimeComparison.cached.p95}
                                    nonCachedMs={cache.responseTimeComparison.nonCached.p95}
                                />
                            </div>
                            {/* Raw numbers */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-primary)]">
                                <div className="space-y-1 text-[10px] font-mono">
                                    <p className="text-emerald-500 uppercase tracking-widest">Cached</p>
                                    <p className="text-[var(--text-secondary)]">AVG: <span className="text-emerald-500">{cache.responseTimeComparison.cached.avg}ms</span></p>
                                    <p className="text-[var(--text-secondary)]">P50: <span className="text-emerald-500">{cache.responseTimeComparison.cached.p50}ms</span></p>
                                    <p className="text-[var(--text-secondary)]">P95: <span className="text-emerald-500">{cache.responseTimeComparison.cached.p95}ms</span></p>
                                </div>
                                <div className="space-y-1 text-[10px] font-mono">
                                    <p className="text-[var(--accent)] uppercase tracking-widest">Non-cached</p>
                                    <p className="text-[var(--text-secondary)]">AVG: <span className="text-[var(--accent)]">{cache.responseTimeComparison.nonCached.avg}ms</span></p>
                                    <p className="text-[var(--text-secondary)]">P50: <span className="text-[var(--accent)]">{cache.responseTimeComparison.nonCached.p50}ms</span></p>
                                    <p className="text-[var(--text-secondary)]">P95: <span className="text-[var(--accent)]">{cache.responseTimeComparison.nonCached.p95}ms</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Time Series Table */}
                    {cache.timeSeries && cache.timeSeries.length > 0 && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">Cache Hit Rate theo ngày</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Ngày</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Hits</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Misses</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Hit Rate</th>
                                            <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Visual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cache.timeSeries.map((row) => {
                                            const pct = Math.round(row.hitRate * 100);
                                            const color =
                                                pct >= 40 ? "bg-emerald-500" : pct >= 20 ? "bg-yellow-500" : "bg-red-500";
                                            return (
                                                <tr key={row.date} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                                                    <td className="px-4 py-2.5 text-[var(--text-primary)] font-mono">{row.date}</td>
                                                    <td className="px-4 py-2.5 text-emerald-500 font-mono">{row.hits}</td>
                                                    <td className="px-4 py-2.5 text-[var(--text-muted)] font-mono">{row.misses}</td>
                                                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-500">{pct}%</td>
                                                    <td className="px-4 py-2.5 w-32">
                                                        <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${color} rounded-full transition-all duration-500`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Errors ───────────────────────────────────────────────────────── */}
            {errors && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-center justify-between">
                        <h3 className="text-xs text-red-500 uppercase tracking-widest font-mono flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Lỗi AI ({errors.total})
                        </h3>
                        {errors.errorsByType && (
                            <div className="flex gap-2 flex-wrap">
                                {errors.errorsByType.map((e) => (
                                    <span key={e.type} className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-mono border border-red-500/20">
                                        {e.type}: {e.count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                    <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Loại lỗi</th>
                                    <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Nội dung</th>
                                    <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Câu hỏi</th>
                                    <th className="px-4 py-2 text-left text-[var(--text-muted)] font-mono uppercase tracking-widest">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-muted)] font-mono">
                                            Không có lỗi 🎉
                                        </td>
                                    </tr>
                                ) : (
                                    errors.data.map((e, i) => (
                                        <tr key={`${e.messageId}-${i}`} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                                            <td className="px-4 py-2 text-red-500 font-mono">{e.errorType}</td>
                                            <td className="px-4 py-2 text-[var(--text-secondary)] truncate max-w-[200px]" title={e.errorMessage}>{e.errorMessage}</td>
                                            <td className="px-4 py-2 text-[var(--text-primary)] truncate max-w-[200px]" title={e.question}>{e.question}</td>
                                            <td className="px-4 py-2 text-[var(--text-muted)] font-mono text-[10px]">
                                                {new Date(e.timestamp).toLocaleString("vi-VN")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
