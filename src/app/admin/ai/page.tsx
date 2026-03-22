"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, AIPerformanceResponse, AIErrorsResponse } from "@/lib/adminService";

function MetricCard({ label, value, sub, accent = "text-white" }: { label: string; value: string; sub?: string; accent?: string }) {
    return (
        <div className="bg-[#080808] border border-gray-800/40 rounded-lg p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">{label}</p>
            <p className={`text-xl font-bold ${accent}`}>{value}</p>
            {sub && <p className="text-[10px] text-gray-600 font-mono mt-1">{sub}</p>}
        </div>
    );
}

export default function AdminAIPage() {
    const [perf, setPerf] = useState<AIPerformanceResponse | null>(null);
    const [errors, setErrors] = useState<AIErrorsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, e] = await Promise.allSettled([
                adminService.getAIPerformance(),
                adminService.getAIErrors({ limit: 20 }),
            ]);
            if (p.status === "fulfilled") setPerf(p.value);
            if (e.status === "fulfilled") setErrors(e.value);
        } catch (err) {
            console.error("Failed to fetch AI data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-gray-500 animate-pulse text-sm tracking-widest uppercase font-mono">Đang tải dữ liệu AI...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Hiệu suất AI</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Metrics kỹ thuật và theo dõi lỗi</p>
                </div>
                <button onClick={fetchData}
                    className="text-[10px] text-gray-400 hover:text-white font-mono uppercase tracking-widest px-3 py-1.5 border border-gray-800 rounded transition-colors">
                    Làm mới
                </button>
            </div>

            {/* Performance Overview */}
            {perf && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <MetricCard label="TB Response Time" value={`${(perf.overview.avgResponseTime / 1000).toFixed(1)}s`} accent="text-orange-400" />
                        <MetricCard label="P50" value={`${(perf.overview.p50ResponseTime / 1000).toFixed(1)}s`} />
                        <MetricCard label="P95" value={`${(perf.overview.p95ResponseTime / 1000).toFixed(1)}s`} accent="text-yellow-400" />
                        <MetricCard label="P99" value={`${(perf.overview.p99ResponseTime / 1000).toFixed(1)}s`} accent="text-red-400" />
                        <MetricCard label="TTFT (TB)" value={`${perf.overview.avgTTFT}ms`} accent="text-brand" />
                        <MetricCard label="Tổng chi phí" value={`$${perf.overview.totalCost.toFixed(2)}`} accent="text-green-400" />
                        <MetricCard label="Chi phí/tin" value={`$${perf.overview.avgCostPerMessage.toFixed(4)}`} />
                    </div>

                    {/* Model Distribution */}
                    {perf.modelDistribution && perf.modelDistribution.length > 0 && (
                        <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-4">Phân bổ Model</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-800/60">
                                            <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Model</th>
                                            <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Số lượng</th>
                                            <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">TB Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {perf.modelDistribution.map((m) => (
                                            <tr key={m.model} className="border-b border-gray-800/30">
                                                <td className="px-4 py-2 text-orange-400 font-mono">{m.model}</td>
                                                <td className="px-4 py-2 text-gray-300 font-mono">{m.count.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-gray-400 font-mono">{(m.avgTime / 1000).toFixed(1)}s</td>
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
                            <MetricCard label="Output Tokens" value={perf.tokenUsage.totalOutputTokens.toLocaleString()} accent="text-orange-400" />
                            <MetricCard label="TB Input/tin" value={perf.tokenUsage.avgInputTokensPerMessage.toLocaleString()} />
                        </div>
                    )}
                </>
            )}

            {/* Errors */}
            {errors && (
                <div className="bg-[#0d0d0d] border border-gray-800/60 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
                        <h3 className="text-xs text-red-400 uppercase tracking-widest font-mono flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Lỗi AI ({errors.total})
                        </h3>
                        {errors.errorsByType && (
                            <div className="flex gap-2">
                                {errors.errorsByType.map((e) => (
                                    <span key={e.type} className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono">
                                        {e.type}: {e.count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-800/60">
                                    <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Loại lỗi</th>
                                    <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Nội dung</th>
                                    <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Câu hỏi</th>
                                    <th className="px-4 py-2 text-left text-gray-500 font-mono uppercase tracking-widest">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.data.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-600 font-mono">Không có lỗi 🎉</td></tr>
                                ) : (
                                    errors.data.map((e, i) => (
                                        <tr key={`${e.messageId}-${i}`} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                                            <td className="px-4 py-2 text-red-400 font-mono">{e.errorType}</td>
                                            <td className="px-4 py-2 text-gray-400 truncate max-w-[200px]">{e.errorMessage}</td>
                                            <td className="px-4 py-2 text-gray-300 truncate max-w-[200px]">{e.question}</td>
                                            <td className="px-4 py-2 text-gray-500 font-mono text-[10px]">{new Date(e.timestamp).toLocaleString("vi-VN")}</td>
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
