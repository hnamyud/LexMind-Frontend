"use client";

import React, { useEffect, useRef, useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatService, StreamChunk, StepChunk } from "@/lib/chatService";
import { messageService } from "@/lib/messageService";
import { useAuthStore } from "@/store/authStore";
import { useAuthHasHydrated } from "@/store/authStore";

import { useConversationStore } from "@/store/conversationStore";
import { useRouter } from "next/navigation";
import LawDetailPanel from "@/components/chat/LawDetailPanel";
import { refTextToNodeId } from "@/lib/lawService";
import { feedbackService } from "@/lib/feedbackService";
import FeedbackModal from "@/components/chat/FeedbackModal";
import { ChatInput } from "@/components/chat/ChatInput";

// ─── Types ────────────────────────────────────────────────────────────────────
type StreamStage = "IDLE" | "ANALYZING" | "RETRIEVING" | "ANSWERING" | "DONE";

interface MessageStep {
    step: number;
    node: string;
    label: string;
}

interface Source {
    type: string;
    id?: string;
    score?: number;
    url?: string;
    doc_ref?: string;
    source_title?: string;
    path?: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    steps?: MessageStep[];
    sources?: Source[];
    streaming?: boolean;
    error?: string;
    // ── Stage machine fields ──
    streamStage?: StreamStage;
    processLogs?: { id: string, text: string, group: number, stage?: string }[];
    queryMode?: string;
}

// ─── Stage grouping ────────────────────────────────────────────────────────────
const GROUP1_STAGES = new Set(["route", "rewrite", "cache"]);
const GROUP2_STAGES = new Set(["retrieval", "reflect"]);

function getStageGroup(stage?: string): 1 | 2 | 3 | null {
    if (!stage) return null;
    if (GROUP1_STAGES.has(stage)) return 1;
    if (GROUP2_STAGES.has(stage)) return 2;
    if (stage === "generate") return 3;
    return null;
}

// ─── Source ID parser ─────────────────────────────────────────────────────────
function parseSourceId(id: string): string | null {
    // format mới: có thể có tiền tố (vd: nd168_2024_d7_k7_c hoặc l35_2024_dieu_13)
    const match = id.match(/^(?:([a-z0-9_]+?)_)?(?:dieu_|d)(\d+)(?:_k(\d+))?(?:_([a-z\u00f0-\u00ff]+))?$/);
    if (!match) return null;
    const [, docRefRaw, dieu, khoan, diem] = match;
    let result = `Điều ${dieu}`;
    if (khoan) result += `, Khoản ${khoan}`;
    if (diem) result += `, Điểm ${diem}`;

    if (docRefRaw) {
        if (docRefRaw === "nd168_2024") result += " (NĐ 168/2024)";
        else if (docRefRaw === "l35_2024") result += " (Luật ĐB 2024)";
        else if (docRefRaw === "l36_2024") result += " (Luật TTATGT 2024)";
    }
    return result;
}

// ─── Strip leading emoji from process text ────────────────────────────────────
function stripEmoji(text: string): string {
    return text.replace(/^[^\w\sđĐ]+\s*/, '');
}

// ─── Regex to detect law references like [Điều 23, Khoản 1, ...] ─────────────
const LAW_REF_REGEX = /\[([^\]]*?Điều[^\]]*?)\]/g;

/** Format backend RRF score (0.010 - 0.050) into a recognizable percentage 50% - 99% */
function formatRRFScore(score: number): number {
    if (score >= 0.05) return 99;
    if (score <= 0.01) return 50;
    const percent = 50 + ((score - 0.01) / 0.04) * 49;
    return Math.round(percent);
}

/**
 * Render text nodes with law references as clickable buttons.
 * Detects patterns like [Điều 23, Khoản 1, Nghị định 168/2024/NĐ-CP]
 */
function LawRefText({ text, onLawClick }: { text: string; onLawClick?: (nodeId: string) => void }) {
    if (!onLawClick) return <>{text}</>;

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(LAW_REF_REGEX.source, 'g');

    while ((match = regex.exec(text)) !== null) {
        // Text trước match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const fullMatch = match[0]; // e.g. "[Điều 23, Khoản 1, Nghị định 168/2024/NĐ-CP]"
        const innerText = match[1]; // e.g. "Điều 23, Khoản 1, Nghị định 168/2024/NĐ-CP"
        const nodeId = refTextToNodeId(fullMatch);

        if (nodeId) {
            parts.push(
                <button
                    key={`law-${match.index}`}
                    type="button"
                    onClick={(e) => { e.preventDefault(); onLawClick(nodeId); }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-border)] transition-all cursor-pointer text-[13px] font-medium leading-snug align-baseline text-left"
                    title={`Tra cứu: ${innerText}`}
                >
                    <svg className="w-3 h-3 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {innerText}
                </button>
            );
        } else {
            parts.push(fullMatch);
        }

        lastIndex = match.index + fullMatch.length;
    }

    // Text sau match cuối
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    if (parts.length === 0) return <>{text}</>;
    return <>{parts}</>;
}

/** Recursively process React children, replacing string nodes with law-ref-aware text */
function processChildren(
    children: React.ReactNode,
    onLawClick?: (nodeId: string) => void
): React.ReactNode {
    return React.Children.map(children, (child) => {
        if (typeof child === "string") {
            return <LawRefText text={child} onLawClick={onLawClick} />;
        }
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            return React.cloneElement(
                child,
                {},
                processChildren(child.props.children, onLawClick)
            );
        }
        return child;
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Hiển thị các bước xử lý (step) – nhỏ, mờ, có pulse icon */
function StepIndicator({ steps }: { steps: MessageStep[] }) {
    if (!steps.length) return null;
    return (
        <div className="mb-2 space-y-1">
            {steps.map((s, idx) => (
                <div key={`ind-${s.step}-${idx}`} className="flex items-center gap-1.5 animate-pulse-once">
                    <span className="text-[10px] text-gray-600 font-mono">{s.label}</span>
                </div>
            ))}
        </div>
    );
}

/** Nút copy chung với state success */
function CopyButton({ text, className, label }: { text: string; className?: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={className || "text-[11px] text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"}
            title="Sao chép"
            type="button"
        >
            {copied ? (
                <svg className="w-3 h-3" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
            {label && <span>{label}</span>}
        </button>
    );
}

/** Khối thinking – thu gọn được, màu mờ */
function ThinkingBlock({
    content,
    streaming,
}: {
    content: string;
    streaming?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    if (!content) return null;

    return (
        <div className="mb-3">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors select-none"
            >
                {/* Brain icon */}
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="uppercase tracking-widest">
                    {streaming ? "Đang suy nghĩ..." : "Quá trình suy nghĩ"}
                </span>
                {!streaming && (
                    <svg
                        className={`w-2.5 h-2.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {(expanded || streaming) && (
                <div className="mt-1.5 pl-3 border-l border-gray-800 max-h-48 overflow-y-auto">
                    <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap font-mono">
                        {content}
                        {streaming && (
                            <span className="inline-block w-1.5 h-3 bg-gray-600 ml-0.5 animate-pulse align-middle" />
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

function StatusRow({ text, active }: { text: string; active: boolean }) {
    return (
        <div className={`flex items-center gap-2 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
            {active ? (
                <span className="flex gap-0.5 items-center shrink-0">
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--accent)' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:120ms]" style={{ backgroundColor: 'var(--accent)' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:240ms]" style={{ backgroundColor: 'var(--accent)' }} />
                </span>
            ) : (
                <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
            <span
                className="text-[12px] font-mono leading-relaxed break-words"
                style={{
                    color: active ? 'var(--accent)' : 'var(--text-faint)',
                }}
            >
                {text}
            </span>
        </div>
    );
}

function ProcessRowPlayer({ logs, group, activeStage, delayMs = 800 }: { logs: NonNullable<Message['processLogs']>, group: number, activeStage: string, delayMs?: number }) {
    const groupLogs = useMemo(() => logs.filter(l => l.group === group), [logs, group]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const isDone = (group === 1 && (activeStage === 'RETRIEVING' || activeStage === 'ANSWERING' || activeStage === 'DONE')) ||
        (group === 2 && (activeStage === 'ANSWERING' || activeStage === 'DONE'));

    useEffect(() => {
        if (groupLogs.length === 0) return;
        if (isDone) {
            setCurrentIndex(groupLogs.length - 1);
            return;
        }

        if (currentIndex < groupLogs.length - 1) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, delayMs);
            return () => clearTimeout(timer);
        }
    }, [groupLogs.length, currentIndex, delayMs, isDone]);

    if (groupLogs.length === 0) return null;

    const currentLog = groupLogs[currentIndex];

    return <StatusRow text={currentLog.text} active={!isDone} />;
}

/** Bubble tin nhắn AI – state machine: ANALYZING → RETRIEVING → ANSWERING → DONE */
function AiMessage({
    msg,
    isLatest,
    onRegenerate,
    onLawClick,
    onLike,
    onDislike,
}: {
    msg: Message;
    isLatest?: boolean;
    onRegenerate?: (id: string) => void;
    onLawClick?: (nodeId: string) => void;
    onLike?: (id: string) => void;
    onDislike?: (id: string) => void;
}) {
    const [localFeedback, setLocalFeedback] = useState<'like' | 'dislike' | null>(null);
    const [canRegenerate, setCanRegenerate] = useState(true);

    useEffect(() => {
        let id: NodeJS.Timeout;
        if (isLatest && !msg.streaming) {
            id = setTimeout(() => setCanRegenerate(false), 60000);
        }
        return () => { if (id) clearTimeout(id); };
    }, [isLatest, msg.streaming]);

    const stage = msg.streamStage ?? 'IDLE';
    const isAnswering = stage === 'ANSWERING' || stage === 'DONE' || !!msg.content;
    const isDone = !msg.streaming;

    // ── Source chips ──────────────────────────────────────────────────────────
    const EXCLUDED_EXTS = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)(\?.*)?$/i;
    const kgSources = (msg.sources ?? []).filter(s => {
        if (s.type !== 'knowledge_graph' || !s.id) return false;
        return parseSourceId(s.id) !== null;
    });
    const webSources = (msg.sources ?? []).filter(s => s.type === 'web' && s.url && !EXCLUDED_EXTS.test(s.url));

    return (
        <div className="flex flex-col items-start gap-2">

            {/* ── Status rows (above bubble) ─────────────────────────────── */}
            {(msg.processLogs && msg.processLogs.length > 0) && (
                <div className="flex flex-col gap-1.5 px-1">
                    <ProcessRowPlayer logs={msg.processLogs} group={1} activeStage={stage} />
                    <ProcessRowPlayer logs={msg.processLogs} group={2} activeStage={stage} />
                </div>
            )}


            {/* ── Answer bubble ─────────────────────────────────────────── */}
            {(isAnswering || msg.error) && (
                <div
                    className="px-5 py-4 rounded-2xl rounded-tl-sm w-fit max-w-[90%] text-sm leading-relaxed break-words"
                    style={{
                        backgroundColor: 'var(--bg-bubble-ai)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-secondary)',
                        boxShadow: 'var(--shadow-bubble)',
                        borderLeft: '3px solid var(--accent)',
                    }}
                >
                    {/* Thinking block */}
                    {msg.thinking && (
                        <ThinkingBlock content={msg.thinking} streaming={msg.streaming && !msg.content} />
                    )}

                    {/* Markdown content */}
                    {msg.content && (
                        <div className="markdown-body" style={{ color: 'var(--text-secondary)' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ children }) => (
                                        <p className="mb-3 last:mb-0 leading-relaxed">
                                            {processChildren(children, onLawClick)}
                                        </p>
                                    ),
                                    li: ({ children }) => (
                                        <li className="mb-1 leading-relaxed">
                                            {processChildren(children, onLawClick)}
                                        </li>
                                    ),
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                    h1: ({ children }) => <h1 className="text-base font-bold mb-3 mt-1" style={{ color: 'var(--accent)' }}>{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3" style={{ color: 'var(--accent)' }}>{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-2" style={{ color: 'var(--text-primary)' }}>{children}</h3>,
                                    strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>,
                                    em: ({ children }) => <em className="italic" style={{ color: 'var(--text-muted)' }}>{children}</em>,
                                    blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                                    hr: () => <hr className="md-hr" />,
                                    code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
                                        const codeText = String(children).replace(/\n$/, '');
                                        const isBlock = codeText.includes('\n') || Boolean(className);
                                        if (!isBlock) return <code className="md-inline-code" {...props}>{codeText}</code>;
                                        return (
                                            <div className="md-code-block">
                                                <div className="md-code-header">
                                                    <span className="md-code-lang">{className?.replace('language-', '') || 'code'}</span>
                                                    <CopyButton text={codeText} className="md-code-copy" label="Copy" />
                                                </div>
                                                <pre className="md-code-pre"><code>{codeText}</code></pre>
                                            </div>
                                        );
                                    },
                                    table: ({ children }) => <div className="md-table-wrapper"><table className="md-table">{children}</table></div>,
                                    thead: ({ children }) => <thead className="md-thead">{children}</thead>,
                                    tbody: ({ children }) => <tbody>{children}</tbody>,
                                    tr: ({ children }) => <tr className="md-tr">{children}</tr>,
                                    th: ({ children }) => <th className="md-th">{processChildren(children, onLawClick)}</th>,
                                    td: ({ children }) => <td className="md-td">{processChildren(children, onLawClick)}</td>,
                                }}
                            >{msg.content}</ReactMarkdown>
                            {/* Streaming cursor */}
                            {msg.streaming && (
                                <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse align-middle" style={{ backgroundColor: 'var(--accent)' }} />
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {msg.error && <p className="text-xs text-red-400 mt-2">{msg.error}</p>}

                    {/* Sources */}
                    {isDone && (kgSources.length > 0 || webSources.length > 0) && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            {kgSources.length > 0 && (
                                <>
                                    <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-faint)' }}>Nguồn tham chiếu</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {kgSources.map((src, idx) => {
                                            const label = parseSourceId(src.id!) ?? src.id!;
                                            return (
                                                <button
                                                    key={`src-${src.id}-${idx}`}
                                                    type="button"
                                                    onClick={() => onLawClick?.(src.id!)}
                                                    className="px-2.5 py-1 text-[10px] rounded flex flex-col font-mono transition-all cursor-pointer hover:opacity-80 relative overflow-hidden"
                                                    style={{ border: '1px solid var(--accent-border)', color: 'var(--text-muted)', backgroundColor: 'var(--accent-soft)' }}
                                                    title={`Tra cứu: ${src.id}`}
                                                >
                                                    <div className="flex items-center gap-1.5 w-full">
                                                        <span className="font-semibold text-[var(--accent)]">{src.path || label}</span>
                                                        {src.score != null && (
                                                            <span className="text-[var(--accent)] opacity-60 font-bold ml-auto text-[9px]">
                                                                {formatRRFScore(src.score)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    {src.source_title && (
                                                        <span className="text-[9px] opacity-70 mt-0.5 text-left truncate w-full max-w-[200px]" title={src.source_title}>
                                                            {src.source_title}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {webSources.length > 0 && (
                                <div className={kgSources.length > 0 ? 'mt-3' : ''}>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        Tham khảo từ web
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {webSources.map((src, idx) => {
                                            let hostname = '';
                                            try { hostname = new URL(src.url!).hostname; } catch { hostname = src.url!; }
                                            return (
                                                <a
                                                    key={`web-${idx}`}
                                                    href={src.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link flex items-center gap-2 px-2.5 py-1.5 rounded border border-gray-700/60 hover:border-brand/40 bg-gray-900/40 hover:bg-brand/5 transition-all text-[11px] text-gray-400 hover:text-brand"
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0 text-gray-600 group-hover/link:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    <span className="font-mono" title={src.url}>{hostname}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Label + action bar ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 ml-1 mt-1">
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>LexMind</span>
                {msg.queryMode && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-gray-700/50 bg-gray-800/30 text-gray-400">
                        {msg.queryMode === 'penalty_lookup' ? 'Tra cứu xử phạt' : msg.queryMode === 'provision_lookup' ? 'Tra cứu quy định' : msg.queryMode}
                    </span>
                )}
                {isDone && msg.content && (
                    <div className="flex items-center gap-2">
                        {onLike && (
                            <button
                                onClick={() => { setLocalFeedback('like'); onLike(msg.id); }}
                                className={`text-[11px] transition-colors flex items-center gap-1 ${localFeedback === 'like' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Thích câu trả lời này"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                            </button>
                        )}
                        {onDislike && (
                            <button
                                onClick={() => { setLocalFeedback('dislike'); onDislike(msg.id); }}
                                className={`text-[11px] transition-colors flex items-center gap-1 ${localFeedback === 'dislike' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Không thích câu trả lời này"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                            </button>
                        )}
                        <CopyButton
                            text={msg.content}
                            className="text-[11px] transition-colors flex items-center gap-1 ml-1 pl-2 border-l text-[var(--text-muted)] border-[var(--border-primary)]"
                            label="Sao chép"
                        />
                        {isLatest && canRegenerate && onRegenerate && (
                            <button
                                onClick={() => onRegenerate(msg.id)}
                                className="text-[11px] transition-colors flex items-center gap-1 ml-1 pl-2 border-l text-[var(--text-muted)] border-[var(--border-primary)]"
                                title="Tạo lại câu trả lời"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Tạo lại
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const UserMessage = React.memo(({ msg }: { msg: Message }) => {
    return (
        <div className="flex flex-col items-end group w-full">
            <div className="flex items-center justify-end gap-2 w-full">
                <CopyButton
                    text={msg.content}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded shrink-0"
                />
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm leading-relaxed break-words whitespace-pre-wrap"
                    style={{
                        backgroundColor: 'var(--accent-soft)',
                        border: '1px solid var(--accent-border)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-bubble)'
                    }}
                >
                    {msg.content}
                </div>
            </div>
            <span className="text-xs mt-1 uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Bạn</span>
        </div>
    );
});

const MemoizedAiMessage = React.memo((props: {
    msg: Message;
    isLatest?: boolean;
    onRegenerate?: (id: string) => void;
    onLawClick?: (nodeId: string) => void;
    onLike?: (id: string) => void;
    onDislike?: (id: string) => void;
}) => {
    return (
        <div className="w-full flex-col flex items-start">
            <AiMessage {...props} />
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.msg === nextProps.msg &&
        prevProps.isLatest === nextProps.isLatest &&
        prevProps.onRegenerate === nextProps.onRegenerate &&
        prevProps.onLawClick === nextProps.onLawClick &&
        prevProps.onLike === nextProps.onLike &&
        prevProps.onDislike === nextProps.onDislike
    );
});

// ─── Main Page ────────────────────────────────────────────────────────────────
function ChatPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken } = useAuthStore();
    const hasHydrated = useAuthHasHydrated();
    const { setActiveId, addConversation } = useConversationStore();
    const chatStreamRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const autoScrollRef = useRef(true);

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const [lawPanelNodeId, setLawPanelNodeId] = useState<string | null>(null);
    const [dislikeModalMessageId, setDislikeModalMessageId] = useState<string | null>(null);

    const handleLike = useCallback(async (messageId: string) => {
        try {
            await feedbackService.submitFeedback(messageId, true);
        } catch (error) {
            console.error("Failed to submit like feedback", error);
        }
    }, []);

    const handleDislike = useCallback((messageId: string) => {
        setDislikeModalMessageId(messageId);
    }, []);

    const handleSubmitDislikeReason = useCallback(async (reason: string) => {
        if (!dislikeModalMessageId) return;
        try {
            await feedbackService.submitFeedback(dislikeModalMessageId, false, reason);
        } catch (error) {
            console.error("Failed to submit dislike feedback", error);
        } finally {
            setDislikeModalMessageId(null);
        }
    }, [dislikeModalMessageId]);

    const isStreamingRef = useRef(false);

    const handleScroll = useCallback(() => {
        if (!chatStreamRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatStreamRef.current;
        // Check if user is near the bottom (e.g. within 50px)
        const isBottom = scrollHeight - scrollTop - clientHeight < 50;
        autoScrollRef.current = isBottom;
    }, []);
    useEffect(() => {
        isStreamingRef.current = isStreaming;
    }, [isStreaming]);

    // Đọc conversationId từ URL query (?conversationId=xxx)
    useEffect(() => {
        const urlConvId = searchParams.get("conversationId") ?? undefined;
        // Bỏ qua nếu không có sự thực sự thay đổi
        if (urlConvId === conversationId) return;

        autoScrollRef.current = true;
        setConversationId(urlConvId);

        if (urlConvId) {
            setActiveId(urlConvId);

            // Nếu ta đang stream (tức là mới văng từ màn hình New Chat sang URL này nhờ chunk 'info')
            // Thì KHÔNG fetch lại history khỏi DB, vì messages đang nằm trên RAM rồi.
            if (isStreamingRef.current) return;

            setIsLoadingHistory(true);
            messageService.getMessagesByConversation(urlConvId, 1, 15)
                .then(res => {
                    const list = res.result || res.data || [];
                    // Tin nhắn trả về từ mới nhất -> cũ nhất, cần đảo lại
                    const history: Message[] = list.map(m => ({
                        id: m.id,
                        role: (m.sender === "bot" ? "assistant" : "user") as "user" | "assistant",
                        content: m.content,
                        thinking: m.thought || undefined,
                        sources: m.metadata?.sources || undefined,
                    })).reverse();
                    setMessages(history);
                    setHasMoreHistory(list.length === 15);
                    setPage(1);
                })
                .catch(err => console.error("Failed to load generic messages", err))
                .finally(() => setIsLoadingHistory(false));

        } else {
            // New chat
            if (!isStreamingRef.current) {
                setMessages([]);
                setHasMoreHistory(false);
                setPage(1);
            }
        }
    }, [searchParams, setActiveId, conversationId]);

    // Logic auto-scroll linh hoạt: chỉ cuộn xuống nếu được cho phép (bật khi mở chat, gửi/nhận tin nhắn)
    useEffect(() => {
        if (chatStreamRef.current && autoScrollRef.current) {
            chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
            setTimeout(() => {
                if (chatStreamRef.current && autoScrollRef.current) {
                    chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
                }
            }, 50);
        }
    }, [messages]);

    // Scroll xuống khi bubble answer xuất hiện lần đầu (ANSWERING stage mount)
    const lastMsgStage = messages.length > 0 ? messages[messages.length - 1].streamStage : undefined;
    useEffect(() => {
        if (lastMsgStage === 'ANSWERING' && chatStreamRef.current && autoScrollRef.current) {
            chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
        }
    }, [lastMsgStage]);

    const handleLoadMore = useCallback(async () => {
        if (!conversationId || isLoadingMore || isStreamingRef.current) return;
        setIsLoadingMore(true);
        autoScrollRef.current = false;
        const nextPage = page + 1;

        // Lưu lại chiều cao của scroll container trước khi render thêm tin nhắn mới (phía trên)
        const currentScrollHeight = chatStreamRef.current?.scrollHeight || 0;

        try {
            const res = await messageService.getMessagesByConversation(conversationId, nextPage, 15);
            const list = res.result || res.data || [];
            if (list.length > 0) {
                const history: Message[] = list.map(m => ({
                    id: m.id,
                    role: (m.sender === "bot" ? "assistant" : "user") as "user" | "assistant",
                    content: m.content,
                    thinking: m.thought || undefined,
                    sources: m.metadata?.sources || undefined,
                })).reverse();

                setMessages(prev => [...history, ...prev]);
                setPage(nextPage);
                setHasMoreHistory(list.length === 15);

                // Sau khi render xong, phục hồi lại vị trí scroll (tránh bị nhảy lên tuốt lên trên)
                requestAnimationFrame(() => {
                    if (chatStreamRef.current) {
                        const newScrollHeight = chatStreamRef.current.scrollHeight;
                        chatStreamRef.current.scrollTop += (newScrollHeight - currentScrollHeight);
                    }
                });
            } else {
                setHasMoreHistory(false);
            }
        } catch (err) {
            console.error("Failed to load older messages", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [conversationId, page, isLoadingMore]);

    // Redirect nếu chưa đăng nhập (chỉ sau khi Zustand đã rehydrate)
    useEffect(() => {
        if (hasHydrated && !accessToken) router.replace("/login");
    }, [hasHydrated, accessToken, router]);

    const updateLastMessage = useCallback((updater: (msg: Message) => Message) => {
        setMessages((prev) => {
            if (!prev.length) return prev;
            const copy = [...prev];
            copy[copy.length - 1] = updater(copy[copy.length - 1]);
            return copy;
        });
    }, []);

    const handleSend = useCallback(async (question: string) => {
        if (!question.trim() || isStreamingRef.current) return;

        const isNewChat = !conversationId;

        autoScrollRef.current = true;
        setIsStreaming(true);

        // Tạo AbortController mới cho request này
        const abort = new AbortController();
        abortRef.current = abort;

        // Thêm user message
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: question.trim(),
        };

        // Thêm placeholder AI message
        const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: "",
            steps: [],
            thinking: "",
            streaming: true,
            streamStage: "IDLE",
        };

        setMessages((prev) => [...prev, userMsg, aiMsg]);

        // Đẩy conversation kên đầu (nếu là cũ)
        if (conversationId) {
            useConversationStore.getState().bumpConversation(conversationId);
        }

        try {
            await chatService.askStream(
                { question: question.trim(), conversationId },
                (chunk: StreamChunk) => {
                    switch (chunk.type) {
                        case "step":
                            updateLastMessage((msg) => ({
                                ...msg,
                                steps: [...(msg.steps ?? []), chunk as StepChunk],
                            }));
                            break;
                        case "thinking":
                            updateLastMessage((msg) => ({
                                ...msg,
                                thinking: (msg.thinking ?? "") + chunk.content,
                            }));
                            break;
                        case "answer":
                            updateLastMessage((msg) => ({
                                ...msg,
                                content: msg.content + chunk.content,
                                streamStage: "ANSWERING",
                            }));
                            break;
                        case "process": {
                            const pc = chunk as any;
                            const stage: string | undefined = pc.stage;
                            const rawText = pc.message || pc.label || pc.content || pc.node || "Đang xử lý...";
                            const text = stripEmoji(rawText);
                            const group = getStageGroup(stage) || 3;
                            updateLastMessage((msg) => {
                                const newLogs = [...(msg.processLogs || []), { id: Date.now().toString() + Math.random(), text, group, stage }];
                                let newStage = msg.streamStage;
                                if (group === 1 && newStage !== "RETRIEVING" && newStage !== "ANSWERING" && newStage !== "DONE") {
                                    newStage = "ANALYZING";
                                } else if (group === 2 && newStage !== "ANSWERING" && newStage !== "DONE") {
                                    newStage = "RETRIEVING";
                                }
                                return { ...msg, streamStage: newStage, processLogs: newLogs };
                            });
                            break;
                        }
                        case "info":
                            if ((chunk as any).conversationId && !conversationId) {
                                router.replace(`/chat?conversationId=${(chunk as any).conversationId}`);
                                // Re-fetch the sidebar silently if needed
                                useConversationStore.getState().fetchConversations(1);
                            }
                            break;
                        case "message_id":
                            updateLastMessage((msg) => ({
                                ...msg,
                                id: (chunk as any).messageId || msg.id
                            }));
                            break;
                        case "metadata": {
                            const rawSources = chunk.content?.sources || [];
                            const xmlContext = chunk.content?.context || "";

                            const enrichedSources = rawSources.map((s: Source) => {
                                if (s.type === "knowledge_graph" && s.id) {
                                    // Use simple matching to extract from xmlContext safely
                                    const sourceBlockMatches = xmlContext.match(new RegExp(`<source[^>]*id="${s.id}"[^>]*>.*?<\\/source>`, 's'));
                                    if (sourceBlockMatches) {
                                        const innerXml = sourceBlockMatches[0];
                                        const docRef = innerXml.match(/<doc_ref>(.*?)<\/doc_ref>/s)?.[1] || "";
                                        const sourceTitle = innerXml.match(/<source_title>(.*?)<\/source_title>/s)?.[1] || "";
                                        const path = innerXml.match(/<path>(.*?)<\/path>/s)?.[1] || "";
                                        return { ...s, doc_ref: docRef, source_title: sourceTitle, path };
                                    }
                                }
                                return s;
                            });

                            updateLastMessage((msg) => ({
                                ...msg,
                                sources: enrichedSources,
                                queryMode: chunk.content?.query_mode || msg.queryMode,
                            }));
                            break;
                        }
                        case "done":
                            updateLastMessage((msg) => ({ ...msg, streaming: false, streamStage: "DONE" }));
                            break;
                    }
                }
                , abort.signal);
        } catch (err) {
            if ((err as any)?.name === "AbortError" || abort.signal.aborted) {
                // User chủ động hủy
                updateLastMessage((msg) => ({
                    ...msg,
                    streaming: false,
                    content: msg.content
                        ? `${msg.content}\n\n> *Thao tác bị hủy bỏ bởi người dùng.*`
                        : "> *Thao tác bị hủy bỏ bởi người dùng.*",
                    streamStage: "DONE"
                }));
            } else {
                const errorMsg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
                updateLastMessage((msg) => ({
                    ...msg,
                    streaming: false,
                    error: errorMsg,
                }));
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;

            if (isNewChat) {
                // Refresh list chat sau khi trả lời xong câu đầu tiên để cập nhật AI generated title
                setTimeout(() => {
                    useConversationStore.getState().fetchConversations(1);
                }, 2000);
                // Background refresh dự phòng trường hợp API generate title tốn nhiều thời gian hơn
                setTimeout(() => {
                    useConversationStore.getState().fetchConversations(1);
                }, 5000);
            }
        }
    }, [conversationId, updateLastMessage, addConversation, setActiveId]);

    const handleRegenerate = useCallback(async (messageId: string) => {
        if (isStreamingRef.current) return;
        setIsStreaming(true);
        autoScrollRef.current = true;

        // Tìm index message AI
        setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === messageId);
            if (idx === -1) return prev;
            const copy = [...prev];
            copy[idx] = {
                ...copy[idx],
                content: "",
                thinking: "",
                steps: [],
                sources: undefined,
                streaming: true,
                streamStage: "IDLE",
                processLogs: [],
                error: undefined,
            };
            return copy;
        });

        try {
            const abort = new AbortController();
            abortRef.current = abort;
            await chatService.regenerateStream(messageId, (chunk: StreamChunk) => {
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === messageId);
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    const msg = { ...copy[idx] };
                    switch (chunk.type) {
                        case "step":
                            msg.steps = [...(msg.steps ?? []), chunk as StepChunk];
                            break;
                        case "thinking":
                            msg.thinking = (msg.thinking ?? "") + chunk.content;
                            break;
                        case "answer":
                            msg.content = msg.content + chunk.content;
                            msg.streamStage = "ANSWERING";
                            break;
                        case "process": {
                            const pc = chunk as any;
                            const stage: string | undefined = pc.stage;
                            const rawText = pc.message || pc.label || pc.content || pc.node || "Đang xử lý...";
                            const text = stripEmoji(rawText);
                            const group = getStageGroup(stage) || 3;

                            msg.processLogs = [...(msg.processLogs || []), { id: Date.now().toString() + Math.random(), text, group, stage }];

                            if (group === 1 && msg.streamStage !== "RETRIEVING" && msg.streamStage !== "ANSWERING" && msg.streamStage !== "DONE") {
                                msg.streamStage = "ANALYZING";
                            } else if (group === 2 && msg.streamStage !== "ANSWERING" && msg.streamStage !== "DONE") {
                                msg.streamStage = "RETRIEVING";
                            }
                            break;
                        }
                        case "message_id":
                            msg.id = (chunk as any).messageId || msg.id;
                            break;
                        case "metadata": {
                            const rawSources = chunk.content?.sources || [];
                            const xmlContext = chunk.content?.context || "";

                            const enrichedSources = rawSources.map((s: Source) => {
                                if (s.type === "knowledge_graph" && s.id) {
                                    const sourceBlockMatches = xmlContext.match(new RegExp(`<source[^>]*id="${s.id}"[^>]*>.*?<\\/source>`, 's'));
                                    if (sourceBlockMatches) {
                                        const innerXml = sourceBlockMatches[0];
                                        const docRef = innerXml.match(/<doc_ref>(.*?)<\/doc_ref>/s)?.[1] || "";
                                        const sourceTitle = innerXml.match(/<source_title>(.*?)<\/source_title>/s)?.[1] || "";
                                        const path = innerXml.match(/<path>(.*?)<\/path>/s)?.[1] || "";
                                        return { ...s, doc_ref: docRef, source_title: sourceTitle, path };
                                    }
                                }
                                return s;
                            });
                            msg.sources = enrichedSources;
                            if (chunk.content?.query_mode) {
                                msg.queryMode = chunk.content.query_mode;
                            }
                            break;
                        }
                        case "done":
                            msg.streaming = false;
                            msg.streamStage = "DONE";
                            break;
                    }
                    copy[idx] = msg;
                    return copy;
                });
            }, abort.signal);
        } catch (err) {
            if ((err as any)?.name === "AbortError" || abortRef.current?.signal.aborted) {
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === messageId);
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    copy[idx] = {
                        ...copy[idx],
                        streaming: false,
                        content: copy[idx].content
                            ? `${copy[idx].content}\n\n> *Thao tác bị hủy bỏ bởi người dùng.*`
                            : "> *Thao tác bị hủy bỏ bởi người dùng.*",
                        streamStage: "DONE"
                    };
                    return copy;
                });
            } else {
                const errorMsg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === messageId);
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], streaming: false, error: errorMsg };
                    return copy;
                });
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, []);

    const handleCancel = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const showHero = messages.length === 0;

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
            {/* Hero Section – chỉ hiện khi chưa có messages */}
            {showHero && (
                <div className="flex flex-col items-center justify-center py-8 px-6 md:py-12 md:px-6">
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="typing-effect text-xl sm:text-2xl md:text-4xl font-bold tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            LexMind: Advanced Legal Intelligence.
                        </h1>
                    </div>
                    <p className="mt-4 text-sm md:text-base font-medium text-center px-2" style={{ color: 'var(--text-muted)' }}>
                        Sophisticated legal reasoning at your fingertips.
                    </p>
                </div>
            )}

            {/* Chat Stream */}
            <section
                ref={chatStreamRef}
                onScroll={handleScroll}
                className="chat-stream flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-6 space-y-6 md:space-y-8 max-w-4xl mx-auto w-full pb-48"
            >
                {isLoadingHistory ? (
                    <div className="flex justify-center py-10">
                        <span className="text-gray-500 animate-pulse text-sm tracking-widest uppercase">Đang tải lịch sử...</span>
                    </div>
                ) : (
                    <>
                        {hasMoreHistory && !isStreaming && (
                            <div className="flex justify-center py-2 mb-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-muted)',
                                        border: '1px solid var(--border-subtle)'
                                    }}
                                >
                                    {isLoadingMore ? "Đang tải..." : "Tải thêm tin nhắn cũ"}
                                </button>
                            </div>
                        )}
                        {messages.map((msg) =>
                            msg.role === "user" ? (
                                <UserMessage key={msg.id} msg={msg} />
                            ) : (
                                <MemoizedAiMessage
                                    key={msg.id}
                                    msg={msg}
                                    isLatest={messages.length > 0 && messages[messages.length - 1].id === msg.id}
                                    onRegenerate={handleRegenerate}
                                    onLawClick={setLawPanelNodeId}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                />
                            )
                        )}
                    </>
                )}
            </section>

            {/* Input Area */}
            <ChatInput
                onSend={handleSend}
                onCancel={handleCancel}
                isStreaming={isStreaming}
            />

            {/* Law Detail Panel */}
            <LawDetailPanel
                nodeId={lawPanelNodeId}
                onClose={() => setLawPanelNodeId(null)}
            />

            {/* Feedback Modal */}
            {dislikeModalMessageId && (
                <FeedbackModal
                    onClose={() => setDislikeModalMessageId(null)}
                    onSubmit={handleSubmitDislikeReason}
                />
            )}
        </main>
    );
}

// Wrap trong Suspense để fix lỗi prerender khi dùng useSearchParams
export default function ChatPage() {
    return (
        <Suspense fallback={
            <main className="flex-1 flex items-center justify-center">
                <span className="text-gray-600 animate-pulse text-sm tracking-widest uppercase">Đang tải...</span>
            </main>
        }>
            <ChatPageInner />
        </Suspense>
    );
}
