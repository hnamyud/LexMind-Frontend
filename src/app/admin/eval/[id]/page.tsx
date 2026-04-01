"use client";

import React, { useEffect, useState, use } from "react";
import { evalService, EvalSession, EvalRun, EvalStatsResponse } from "@/lib/evalService";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function EvalScorePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    
    const [session, setSession] = useState<EvalSession | null>(null);
    const [runs, setRuns] = useState<EvalRun[]>([]);
    const [stats, setStats] = useState<EvalStatsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [viewingRunId, setViewingRunId] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [resultsRes, statsRes] = await Promise.all([
                evalService.getResults(id),
                evalService.getStats(id)
            ]);
            setSession(resultsRes.session);
            setRuns(resultsRes.runs || []);
            setStats(statsRes);
        } catch (err: any) {
            setError(err.message || "Failed to load evaluation details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const handleOpenViewModal = (run: EvalRun) => {
        setViewingRunId(run.id);
    };

    if (isLoading) {
        return <div className="text-[var(--text-muted)] animate-pulse p-10">Loading session details...</div>;
    }

    if (error || !session) {
        return <div className="text-red-400 p-10">{error || "Session not found."}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/eval" className="p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-primary)]">
                    <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] uppercase tracking-tight">EVAL SESSION: {session.project_name ? session.project_name : session.id.split("-")[0]}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">Dataset: {session.dataset} {session.source_doc ? `| Source: ${session.source_doc} ` : ""}| Status: {session.status}</p>
                        {session.langsmith_url && (
                            <a 
                                href={session.langsmith_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                            >
                                LANGSMITH
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Scored</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.scored} <span className="text-sm font-normal text-[var(--text-muted)]">/ {stats.total}</span></p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Correctness</p>
                        <p className="text-2xl font-bold text-[var(--accent)]">{stats.pct_correctness?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Groundedness</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pct_groundedness?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Behavior</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pct_behavior?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Citation</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pct_citation?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Avg Hit Rate</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.avg_retrieval_hit_rate?.toFixed(1) || 0}%</p>
                    </div>
                </div>
            )}

            {/* Runs Table */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm text-[var(--text-primary)] whitespace-nowrap">
                    <thead className="text-[10px] uppercase font-bold tracking-widest bg-[var(--bg-main)] text-[var(--text-muted)]">
                        <tr>
                            <th className="px-4 py-3 border-b border-[var(--border-primary)]">Q_ID</th>
                            <th className="px-4 py-3 border-b border-[var(--border-primary)]">Question</th>
                            <th className="px-4 py-3 border-b border-[var(--border-primary)]">Scores (Corr/Grnd/Behv/Cite)</th>
                            <th className="px-4 py-3 border-b border-[var(--border-primary)]">Hit Rate</th>
                            <th className="px-4 py-3 border-b border-[var(--border-primary)] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-primary)]">
                        {runs.map(run => (
                            <tr key={run.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                                <td className="px-4 py-3 font-mono text-xs">{run.question_id}</td>
                                <td className="px-4 py-3 truncate max-w-xs" title={run.question}>{run.question}</td>
                                <td className="px-4 py-3 font-mono text-xs">
                                    {run.scored_at ? (
                                        <div className="flex gap-2">
                                           <span className={run.score_correctness ? "text-green-500" : "text-red-500"}>{run.score_correctness ? "PASS" : "FAIL"}</span> /
                                           <span className={run.score_groundedness ? "text-green-500" : "text-red-500"}>{run.score_groundedness ? "PASS" : "FAIL"}</span> /
                                           <span className={run.score_behavior ? "text-green-500" : "text-red-500"}>{run.score_behavior ? "PASS" : "FAIL"}</span> /
                                           <span className={run.score_citation ? "text-green-500" : "text-red-500"}>{run.score_citation ? "PASS" : "FAIL"}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[var(--text-muted)] italic">Pending</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-mono">{run.retrieval_hit_rate_pct ?? 0}%</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => handleOpenViewModal(run)}
                                        className="text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest transition-colors bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--text-muted)]"
                                    >
                                        View Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Detail Modal */}
            {viewingRunId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {(() => {
                        const targetRun = runs.find(r => r.id === viewingRunId);
                        if (!targetRun) return null;
                        
                        return (
                        <div className="bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                            <div className="p-5 border-b border-[var(--border-primary)] flex justify-between items-center sticky top-0 bg-[var(--bg-main)] z-10 shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--accent)] uppercase tracking-tight">AI EVAL DETAIL</h2>
                                    <p className="text-xs text-[var(--text-muted)] tracking-widest font-mono mt-1">ID: {targetRun.question_id} {targetRun.scored_at && `| Scored At: ${new Date(targetRun.scored_at).toLocaleString()}`}</p>
                                </div>
                                <button onClick={() => setViewingRunId(null)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Info */}
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1 border-b border-[var(--border-primary)] pb-1">Câu hỏi ({targetRun.question_type})</p>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{targetRun.question}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold mb-1 border-b border-[var(--border-primary)] pb-1">Ground Truth</p>
                                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{targetRun.ground_truth}</p>
                                        <div className="flex gap-1 flex-wrap mt-2">
                                            {targetRun.reference_nodes?.map(n => <span key={n} className="text-[9px] font-mono px-1.5 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded">{n}</span>)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold mb-1 border-b border-[var(--border-primary)] pb-1">Bot Answer</p>
                                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{targetRun.ai_answer}</p>
                                        <div className="flex gap-1 flex-wrap mt-2">
                                            {targetRun.retrieved_nodes?.map(n => <span key={n} className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] rounded">{n}</span>)}
                                        </div>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1 border-b border-[var(--border-primary)] pb-1">Context Text (System Retrieved)</p>
                                      <pre className="text-xs text-[var(--text-muted)] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto bg-[var(--bg-secondary)] p-2 rounded border border-[var(--border-primary)]">{targetRun.context_text}</pre>
                                    </div>
                                </div>

                                {/* Right: Scores Display */}
                                <div className="space-y-5 lg:border-l lg:border-[var(--border-primary)] lg:pl-6">
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">LANGSMITH AUTO-SCORES</h3>
                                    
                                    {[
                                        { key: "score_correctness", label: "Correctness (Answer vs Ground Truth)" },
                                        { key: "score_groundedness", label: "Groundedness (Answer vs Context)" },
                                        { key: "score_behavior", label: "Behavior Compliance" },
                                        { key: "score_citation", label: "Citation Accuracy" }
                                    ].map(metric => {
                                        const val = (targetRun as any)[metric.key];
                                        return (
                                            <div key={metric.key} className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                                                <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-primary)]">{metric.label}</span>
                                                {val === null ? (
                                                    <span className="text-xs text-[var(--text-muted)] italic">N/A</span>
                                                ) : val === true ? (
                                                    <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-500 rounded uppercase tracking-widest">PASS</span>
                                                ) : (
                                                    <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-500 rounded uppercase tracking-widest">FAIL</span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-primary)]">Retrieval Hit Rate</span>
                                            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{targetRun.retrieval_hit_rate_pct ?? 0}%</span>
                                        </div>
                                        <div className="space-y-2 mt-3 pt-3 border-t border-[var(--border-primary)]">
                                            <div>
                                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Missing Nodes:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {targetRun.retrieval_missing?.length ? targetRun.retrieval_missing.map(n => <span key={n} className="text-[9px] font-mono px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded">{n}</span>) : <span className="text-[10px] text-[var(--text-muted)]">None</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Extra Nodes:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {targetRun.retrieval_extra?.length ? targetRun.retrieval_extra.map(n => <span key={n} className="text-[9px] font-mono px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded">{n}</span>) : <span className="text-[10px] text-[var(--text-muted)]">None</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
