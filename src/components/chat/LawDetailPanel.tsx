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
            // Chỉ giữ node từ cấp Điều trở xuống (bỏ Chương, Mục, Phần)
            const STRUCTURAL_PATTERN = /_(CHUONG|MUC|PHAN)(_|$)/i;
            const filtered = (res.data ?? []).filter(
                (n) => !STRUCTURAL_PATTERN.test(n.id)
            );
            setLawNodes(filtered);
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
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <aside
                className={`fixed inset-x-0 bottom-0 z-50 flex h-[82dvh] flex-col rounded-t-[28px] border border-[var(--border-primary)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] transition-transform duration-300 ease-in-out sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[480px] sm:rounded-none sm:rounded-l-[28px] sm:border-y-0 sm:border-r-0 sm:border-l ${
                    isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full"
                } md:w-[520px] lg:w-[560px]`}
            >
                {/* Header */}
                <div
                    className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 py-4 backdrop-blur-xl sm:px-5"
                    style={{ paddingTop: "calc(1rem + var(--safe-area-top) * 0.2)" }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold tracking-tight text-[var(--text-primary)]" title="Tra cứu điều luật">
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
                        className="rounded-full p-2 text-[var(--text-muted)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        title="Đóng (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body – scrollable */}
                <div
                    className="law-panel-scroll flex-1 space-y-4 overflow-y-auto bg-[var(--bg-primary)] px-4 py-4 sm:px-5 sm:py-5"
                    style={{ paddingBottom: "calc(1rem + var(--safe-area-bottom))" }}
                >
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-8 h-8 border-2 border-[var(--accent-border)] border-t-[var(--accent)] rounded-full animate-spin" />
                            <span className="text-xs text-[var(--text-muted)]">Đang tải...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2.5 rounded-[24px] border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                            <svg className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-xs text-[var(--danger)] font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && !error && lawNodes.length === 0 && isOpen && (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
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
                                <LawNodeCard key={`${node.id}-${idx}`} node={node} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

// ─── Sub-component: Law Node Card ─────────────────────────────────────────────
function LawNodeCard({ node, index }: { node: LawNode; index: number }) {
    // Depth indicator: deeper = more indented
    const depth = index; // 0 = top-level (Điều), 1 = Khoản, 2 = Điểm

    return (
        <div
            className={`relative rounded-[22px] border transition-all ${depth === 0
                    ? "border-[var(--legal-border)] bg-[var(--legal-soft)]"
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
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono tracking-wider ${depth === 0
                            ? "border border-[var(--legal-border)] bg-[var(--bg-secondary)] text-[var(--legal)]"
                            : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                        }`}>
                        {node.id}
                    </span>
                </div>

                {/* Title / short text */}
                <p className={`mb-2 text-[13px] font-semibold leading-relaxed ${depth === 0 ? "text-[var(--legal)]" : "text-[var(--text-primary)]"
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
