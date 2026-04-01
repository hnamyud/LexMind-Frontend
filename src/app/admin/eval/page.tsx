"use client";

import React, { useEffect, useState } from "react";
import { evalService, EvalSession, DatasetItem } from "@/lib/evalService";

export default function EvalPage() {
    const [sessions, setSessions] = useState<EvalSession[]>([]);
    const [availableDatasets, setAvailableDatasets] = useState<DatasetItem[]>([]);
    const [availableSourceDocs, setAvailableSourceDocs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dataset, setDataset] = useState("");
    const [sourceDoc, setSourceDoc] = useState("");
    const [concurrency, setConcurrency] = useState(1);
    const [limit, setLimit] = useState<number | "">("");
    const [offset, setOffset] = useState<number | "">(0);
    const [randomSample, setRandomSample] = useState(false);
    const [questionIdsStr, setQuestionIdsStr] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [res, dbRes] = await Promise.all([
                evalService.getSessions(20),
                evalService.getDatasets()
            ]);
            setSessions(res.sessions || []);
            
            const datasetsList = (dbRes as any).datasets || [];
            setAvailableDatasets(datasetsList);
            if (datasetsList.length > 0 && !dataset) {
                setDataset(datasetsList[0].name);
                setAvailableSourceDocs(datasetsList[0].source_docs || []);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRunBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsStarting(true);
        try {
            const res = await evalService.runBatch({
                dataset: dataset || undefined,
                source_doc: sourceDoc || undefined,
                concurrency: concurrency || undefined,
                limit: limit !== "" ? Number(limit) : undefined,
                offset: offset !== "" ? Number(offset) : undefined,
                random_sample: randomSample,
                question_ids: questionIdsStr ? questionIdsStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            });
            if (res.langsmith_url) {
                window.open(res.langsmith_url, '_blank');
            }
            // Fetch immediately, optionally start pooling or just alert
            fetchSessions();
        } catch (err: any) {
            alert("Error starting batch: " + err.message);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">EVALUATION SESSIONS</h1>
                <button
                    onClick={fetchSessions}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors hover:bg-[var(--border-subtle)]"
                >
                    REFRESH
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Run New Batch Form */}
                <div className="lg:col-span-1 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] p-5">
                    <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-[var(--text-primary)]">Run New Batch</h2>
                    <form onSubmit={handleRunBatch} className="space-y-4">
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Dataset</label>
                            {availableDatasets.length > 0 ? (
                                <select 
                                    value={dataset}
                                    onChange={e => {
                                        setDataset(e.target.value);
                                        const ds = availableDatasets.find(d => d.name === e.target.value);
                                        setAvailableSourceDocs(ds?.source_docs || []);
                                        setSourceDoc("");
                                    }}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                >
                                    {availableDatasets.map(d => (
                                        <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={dataset}
                                    onChange={e => setDataset(e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                    placeholder="nd_168_case.json"
                                />
                            )}
                        </div>
                        {availableSourceDocs.length > 0 && (
                            <div>
                                <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Source Doc</label>
                                <select 
                                    value={sourceDoc}
                                    onChange={e => setSourceDoc(e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                >
                                    <option value="">All</option>
                                    {availableSourceDocs.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Concurrency</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={concurrency}
                                    onChange={e => setConcurrency(Number(e.target.value))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Limit</label>
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={e => setLimit(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                    placeholder="All"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Offset</label>
                                <input
                                    type="number"
                                    value={offset}
                                    onChange={e => setOffset(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={randomSample}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none disabled:opacity-50"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex-1 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)]">
                                    <input 
                                        type="checkbox" 
                                        checked={randomSample}
                                        onChange={e => setRandomSample(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                                    />
                                    Random Sample
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Specific Question IDs</label>
                            <input
                                type="text"
                                value={questionIdsStr}
                                onChange={e => setQuestionIdsStr(e.target.value)}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded p-2 text-sm focus:border-[var(--accent)] outline-none"
                                placeholder="q001, q002 (comma separated)"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isStarting}
                            className="w-full py-2 bg-[var(--accent)] text-white text-xs font-bold rounded tracking-widest uppercase hover:opacity-90 disabled:opacity-50 mt-2 transition-opacity"
                        >
                            {isStarting ? "STARTING..." : "START RUN"}
                        </button>
                    </form>
                </div>

                {/* Sessions List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="text-center text-[var(--text-muted)] text-sm animate-pulse py-10">Loading sessions...</div>
                    ) : error ? (
                        <div className="text-red-400 text-sm py-4">{error}</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)] text-sm py-10">No sessions found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {sessions.map(s => (
                                <div
                                    key={s.id}
                                    className="block border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-secondary)] transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">
                                                {s.project_name ? s.project_name : `${s.id.split('-')[0]}***`}
                                            </span>
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-1">
                                                {s.dataset} {s.source_doc && <span className="text-[10px] font-mono font-normal ml-2 bg-[var(--bg-input)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-primary)]">{s.source_doc}</span>}
                                            </h3>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {s.langsmith_url && (
                                                <a 
                                                    href={s.langsmith_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                                                >
                                                    LANGSMITH
                                                </a>
                                            )}
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                                                s.status === 'done' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                                s.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                                'bg-gray-500/10 text-[var(--text-muted)] border border-gray-500/20'
                                            }`}>
                                                {s.status}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5 mt-3 overflow-hidden">
                                        <div 
                                            className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${s.progress_pct || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2.5">
                                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                            {new Date(s.created_at).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-[var(--text-primary)] font-semibold">
                                            {s.completed} / {s.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
