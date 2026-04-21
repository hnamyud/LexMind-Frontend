"use client";

import { useEffect, useState, useCallback } from "react";
import { lawService, LawNode } from "@/lib/lawService";

interface LawDetailPanelProps {
    nodeId: string | null;
    onClose: () => void;
}

export default function LawDetailPanel({ nodeId, onClose }: LawDetailPanelProps) {
    const [lawNodes, setLawNodes] = useState<LawNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isOpen = !!nodeId;

    const fetchLawDetail = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        setLawNodes([]);
        try {
            const res = await lawService.getLawDetail(id);
            setLawNodes(res.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải nội dung điều luật.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (nodeId) fetchLawDetail(nodeId);
    }, [nodeId, fetchLawDetail]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <aside
                className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-[var(--bg-panel)] border-l border-[var(--border-primary)] shadow-2xl transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } w-full sm:w-[480px] md:w-[520px] lg:w-[560px]`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-main)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight overflow-hidden text-ellipsis whitespace-nowrap" title="Tra cứu điều luật">
                                Tra cứu điều luật
                            </h2>
                            {nodeId && (
                                <p
                                    className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap"
                                    title={nodeId}
                                >
                                    {nodeId}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                        title="Đóng (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body – scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 law-panel-scroll bg-[var(--bg-primary)]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-8 h-8 border-2 border-[var(--accent-border)] border-t-[var(--accent)] rounded-full animate-spin" />
                            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Đang tải...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2.5 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-xs text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && !error && lawNodes.length === 0 && isOpen && (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                            <svg className="w-10 h-10 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-xs font-semibold text-[var(--text-muted)]">Không tìm thấy nội dung điều luật.</p>
                        </div>
                    )}

                    {/* Law nodes – hiển thị theo thứ tự từ tổng quát → chi tiết */}
                    {!loading && lawNodes.length > 0 && (
                        <div className="space-y-3">
                            {[...lawNodes].reverse().map((node, idx) => (
                                <LawNodeCard key={`${node.id}-${idx}`} node={node} index={idx} total={lawNodes.length} />
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

// ─── Sub-component: Law Node Card ─────────────────────────────────────────────
function LawNodeCard({ node, index, total }: { node: LawNode; index: number; total: number }) {
    // Depth indicator: deeper = more indented
    const depth = index; // 0 = top-level (Điều), 1 = Khoản, 2 = Điểm

    return (
        <div
            className={`relative rounded-lg border transition-all ${
                depth === 0
                    ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-sm"
            }`}
            style={{ marginLeft: Math.min(depth, 2) * 12 }}
        >
            {/* Connection line */}
            {depth > 0 && (
                <div
                    className="absolute top-0 -left-3 w-3 h-4 border-l border-b border-[var(--border-primary)]"
                    style={{ borderBottomLeftRadius: 6 }}
                />
            )}

            <div className="px-4 py-3">
                {/* Node header */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        depth === 0
                            ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]"
                            : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}>
                        {node.id}
                    </span>
                </div>

                {/* Title / short text */}
                <p className={`text-[13px] font-semibold leading-relaxed mb-2 ${
                    depth === 0 ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                }`}>
                    {node.text}
                </p>

                {/* Full legal text */}
                <div className="text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-2 whitespace-pre-wrap">
                    {node.raw_text}
                </div>
            </div>
        </div>
    );
}
