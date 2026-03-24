"use client";

import React, { useEffect, useRef, useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
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

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;           // nội dung chính (answer)
    thinking?: string;         // nội dung thinking (ẩn/hiện)
    steps?: MessageStep[];     // các bước đang xử lý
    processes?: string[];      // lịch sử các thông báo process
    currentProcess?: string;   // nội dung quá trình LLM đang xử lý (type: process)
    sources?: Source[];
    streaming?: boolean;       // đang stream
    error?: string;
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
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-brand/10 border border-brand/25 text-brand hover:bg-brand/20 hover:border-brand/40 transition-all cursor-pointer text-[13px] font-medium leading-snug align-baseline"
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
                <svg className="w-3 h-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

/** Hiển thị chữ process mượt mà qua mảng để không bị mất text nào khi SSE bắn quá nhanh */
function AnimatedProcessText({ texts }: { texts: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Reset index nếu mảng bị clear (như lúc regenerate)
        if (texts.length === 0 && currentIndex !== 0) {
            setCurrentIndex(0);
        }
    }, [texts.length, currentIndex]);

    useEffect(() => {
        let isCurrent = true;
        const autoAdvance = async () => {
            if (texts && currentIndex < texts.length - 1) {
                // Đợi 1000ms rồi hiển thị process tiếp theo
                await new Promise(r => setTimeout(r, 800));
                if (isCurrent) {
                    setCurrentIndex(c => c + 1);
                }
            }
        };
        autoAdvance();
        return () => { isCurrent = false; };
    }, [currentIndex, texts.length]);

    if (!texts || texts.length === 0) return null;
    
    // Đảm bảo index hợp lệ
    const validIndex = Math.min(currentIndex, texts.length - 1);
    return <>{texts[validIndex]}</>;
}

/** Bubble tin nhắn AI */
function AiMessage({
    msg,
    onRegenerate,
    onLawClick,
    onLike,
    onDislike,
}: {
    msg: Message;
    onRegenerate?: (id: string) => void;
    onLawClick?: (nodeId: string) => void;
    onLike?: (id: string) => void;
    onDislike?: (id: string) => void;
}) {
    const lastStep = msg.steps?.[msg.steps.length - 1];
    const [localFeedback, setLocalFeedback] = useState<'like' | 'dislike' | null>(null);

    return (
        <div className="flex flex-col items-start">
            <div className="ai-glow bg-ai-bubble text-gray-200 px-5 py-4 rounded max-w-[90%] text-sm leading-relaxed border border-gray-800 break-words">
                {/* Steps đang xử lý */}
                {msg.streaming && msg.steps && msg.steps.length > 0 && !msg.content && (
                    <div className="mb-2 space-y-1">
                        {msg.steps.map((s, idx) => (
                            <div key={`step-${s.step}-${idx}`} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-brand/40 animate-pulse" />
                                <span className="text-[10px] text-gray-600 font-mono">{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Last step khi đang stream answer */}
                {msg.streaming && msg.content && lastStep && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-1 h-1 rounded-full bg-brand/40 animate-pulse" />
                        <span className="text-[10px] text-gray-600 font-mono">{lastStep.label}</span>
                    </div>
                )}

                {/* Thinking block */}
                {msg.thinking && (
                    <ThinkingBlock content={msg.thinking} streaming={msg.streaming && !msg.content} />
                )}

                {/* Answer content */}
                {msg.content ? (
                    <div>
                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-200 prose-headings:text-brand prose-strong:text-gray-100 prose-code:text-brand prose-li:text-gray-300">
                            <ReactMarkdown
                                components={{
                                    // Override text rendering inside <p>, <li>, <strong>, etc.
                                    p: ({ children }) => {
                                        return (
                                            <p>
                                                {processChildren(children, onLawClick)}
                                            </p>
                                        );
                                    },
                                    li: ({ children }) => {
                                        return (
                                            <li>
                                                {processChildren(children, onLawClick)}
                                            </li>
                                        );
                                    },
                                }}
                            >{msg.content}</ReactMarkdown>
                            {msg.streaming && !msg.currentProcess && (
                                <span className="inline-block w-1.5 h-4 bg-brand ml-0.5 animate-pulse align-middle" />
                            )}
                        </div>
                        {msg.streaming && msg.currentProcess && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:300ms]" />
                                <span className="text-[11px] text-gray-500 font-mono flex-1">
                                    <AnimatedProcessText texts={msg.processes || []} />
                                </span>
                            </div>
                        )}
                    </div>
                ) : msg.streaming ? (
                    // Placeholder khi chưa có answer
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-1 items-center h-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                        {msg.processes && msg.processes.length > 0 && (
                            <span className="text-[11px] text-gray-500 font-mono">
                                <AnimatedProcessText texts={msg.processes} />
                            </span>
                        )}
                    </div>
                ) : null}

                {/* Error */}
                {msg.error && (
                    <p className="text-xs text-red-400 mt-2">{msg.error}</p>
                )}

                {/* Sources */}
                {!msg.streaming && msg.sources && msg.sources.length > 0 && (() => {
                    const kgSources = msg.sources!.filter(s => s.type === 'knowledge_graph' && s.id);
                    const EXCLUDED_EXTS = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)(\?.*)?$/i;
                    const webSources = msg.sources!.filter(s => s.type === 'web' && s.url && !EXCLUDED_EXTS.test(s.url));
                    return (
                        <div className="mt-3 pt-3 border-t border-gray-800">
                            {/* Knowledge graph sources */}
                            {kgSources.length > 0 && (
                                <>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Nguồn tham chiếu</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {kgSources.map((src, idx) => (
                                            <button
                                                key={`src-${src.id}-${idx}`}
                                                type="button"
                                                onClick={() => onLawClick?.(src.id!)}
                                                className="px-2 py-0.5 text-[10px] rounded border border-gray-700 text-gray-500 font-mono hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all cursor-pointer"
                                                title={`Tra cứu: ${src.id}`}
                                            >
                                                {src.id}
                                                {src.score != null && (
                                                    <span className="ml-1 text-brand/60">
                                                        {formatRRFScore(src.score)}%
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Web reference sources */}
                            {webSources.length > 0 && (
                                <div className={kgSources.length > 0 ? "mt-3" : ""}>
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
                                                    <span className="truncate font-mono">{hostname}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            <div className="flex items-center gap-3 mt-1.5 ml-1">
                <span className="text-xs text-brand uppercase tracking-widest font-bold">LexMind</span>
                {!msg.streaming && msg.content && (
                    <div className="flex items-center gap-2">
                        {onLike && (
                            <button
                                onClick={() => {
                                    setLocalFeedback('like');
                                    onLike(msg.id);
                                }}
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
                                onClick={() => {
                                    setLocalFeedback('dislike');
                                    onDislike(msg.id);
                                }}
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
                            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 ml-1 pl-2 border-l border-gray-800" 
                            label="Sao chép" 
                        />
                        {onRegenerate && (
                            <button
                                onClick={() => onRegenerate(msg.id)}
                                className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 ml-1 pl-2 border-l border-gray-800"
                                title="Tạo lại câu trả lời"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
function ChatPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken } = useAuthStore();
    const hasHydrated = useAuthHasHydrated();
    const { setActiveId, addConversation } = useConversationStore();
    const chatStreamRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [lawPanelNodeId, setLawPanelNodeId] = useState<string | null>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
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

    // Auto-resize textarea based on content
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            const currentScrollHeight = inputRef.current.scrollHeight;
            inputRef.current.style.height = `${currentScrollHeight}px`;
            // Cập nhật state nếu scrollHeight vượt quá maxHeight của CSS
            setIsOverflowing(currentScrollHeight >= 240);
        }
    }, [input]);

    const isStreamingRef = useRef(false);
    useEffect(() => {
        isStreamingRef.current = isStreaming;
    }, [isStreaming]);

    // Đọc conversationId từ URL query (?conversationId=xxx)
    useEffect(() => {
        const urlConvId = searchParams.get("conversationId") ?? undefined;
        // Bỏ qua nếu không có sự thực sự thay đổi
        if (urlConvId === conversationId) return;
        
        setConversationId(urlConvId);
        
        if (urlConvId) {
            setActiveId(urlConvId);
            
            // Nếu ta đang stream (tức là mới văng từ màn hình New Chat sang URL này nhờ chunk 'info')
            // Thì KHÔNG fetch lại history khỏi DB, vì messages đang nằm trên RAM rồi.
            if (isStreamingRef.current) return;

            setIsLoadingHistory(true);
            messageService.getMessagesByConversation(urlConvId, 1, 50)
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
                })
                .catch(err => console.error("Failed to load generic messages", err))
                .finally(() => setIsLoadingHistory(false));
            
        } else {
            // New chat
            if (!isStreamingRef.current) {
                setMessages([]);
            }
        }
    }, [searchParams, setActiveId, conversationId]);

    // Auto-scroll khi messages thay đổi
    useEffect(() => {
        if (chatStreamRef.current) {
            chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
        }
    }, [messages]);

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
        if (!question.trim() || isStreaming) return;

        const isNewChat = !conversationId;

        setInput("");
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
            processes: [],
            thinking: "",
            streaming: true,
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
                                currentProcess: undefined // Ẩn process khi đang in answer nếu muốn, hoặc báo hiệu finish
                            }));
                            break;
                        case "process":
                            const pText = (chunk as any).message || (chunk as any).label || (chunk as any).content || (chunk as any).node || "Đang xử lý...";
                            updateLastMessage((msg) => ({
                                ...msg,
                                processes: [...(msg.processes || []), pText],
                                currentProcess: pText
                            }));
                            break;
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
                        case "metadata":
                            updateLastMessage((msg) => ({
                                ...msg,
                                sources: chunk.content.sources,
                            }));
                            break;
                        case "done":
                            updateLastMessage((msg) => ({ ...msg, streaming: false }));
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
                    currentProcess: undefined
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
    }, [isStreaming, conversationId, updateLastMessage, addConversation, setActiveId]);

    const handleRegenerate = useCallback(async (messageId: string) => {
        if (isStreaming) return;
        setIsStreaming(true);

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
                processes: [],
                sources: undefined,
                streaming: true,
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
                            msg.currentProcess = undefined;
                            break;
                        case "process":
                            const pTextRegen = (chunk as any).message || (chunk as any).label || (chunk as any).content || (chunk as any).node || "Đang xử lý...";
                            msg.processes = [...(msg.processes || []), pTextRegen];
                            msg.currentProcess = pTextRegen;
                            break;
                        case "message_id":
                            msg.id = (chunk as any).messageId || msg.id;
                            break;
                        case "metadata":
                            msg.sources = (chunk as any).content?.sources;
                            break;
                        case "done":
                            msg.streaming = false;
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
                        currentProcess: undefined
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
    }, [isStreaming]);

    const handleCancel = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const showHero = messages.length === 0;

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
            {/* Hero Section – chỉ hiện khi chưa có messages */}
            {showHero && (
                <div className="flex flex-col items-center justify-center py-8 px-6 md:py-12 md:px-6">
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="typing-effect text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-tight break-words">
                            LexMind: Advanced Legal Intelligence.
                        </h1>
                    </div>
                    <p className="mt-4 text-gray-500 text-sm md:text-base font-medium text-center px-2">
                        Sophisticated legal reasoning at your fingertips.
                    </p>
                </div>
            )}

            {/* Chat Stream */}
            <section
                ref={chatStreamRef}
                className="chat-stream flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-6 space-y-6 md:space-y-8 max-w-4xl mx-auto w-full pb-48"
            >
                {isLoadingHistory ? (
                    <div className="flex justify-center py-10">
                        <span className="text-gray-500 animate-pulse text-sm tracking-widest uppercase">Đang tải lịch sử...</span>
                    </div>
                ) : (
                    messages.map((msg) =>
                        msg.role === "user" ? (
                            // User bubble
                            <div key={msg.id} className="flex flex-col items-end group w-full">
                                <div className="flex items-center justify-end gap-2 w-full">
                                    <CopyButton 
                                        text={msg.content} 
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-500 hover:text-gray-300 rounded hover:bg-gray-800 shrink-0" 
                                    />
                                    <div className="bg-user-bubble text-gray-200 px-4 py-3 rounded max-w-[85%] text-sm leading-relaxed border border-gray-700 break-words whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest mr-1">Bạn</span>
                            </div>
                        ) : (
                            // AI bubble
                            <AiMessage 
                                key={msg.id} 
                                msg={msg} 
                                onRegenerate={handleRegenerate} 
                                onLawClick={setLawPanelNodeId}
                                onLike={handleLike}
                                onDislike={handleDislike}
                            />
                        )
                    )
                )}
            </section>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-main shrink-0 w-full absolute bottom-0 left-0">
                <div className="max-w-4xl mx-auto relative group">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={isStreaming}
                        className={`w-full bg-[#161616] border border-gray-800 text-gray-200 text-[15px] py-3 pl-4 pr-12 md:py-4 md:pl-5 md:pr-14 focus:outline-none focus:border-brand focus:ring-0 rounded transition-colors resize-none disabled:opacity-50 leading-relaxed chat-input-scroll ${isOverflowing ? 'overflow-y-auto' : 'overflow-hidden'}`}
                        placeholder="Hỏi LexMind..."
                        style={{ minHeight: 48, maxHeight: 240 }}
                    />
                    <button
                        onClick={isStreaming ? handleCancel : () => handleSend(input)}
                        disabled={!isStreaming && !input.trim()}
                        className={`absolute right-3 bottom-2.5 md:bottom-3 p-2 transition-all rounded ${
                            isStreaming
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                : "text-gray-500 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                        }`}
                        type="button"
                        title={isStreaming ? "Hủy đánh máy (Escape)" : "Gửi (Enter)"}
                    >
                        {isStreaming ? (
                            // Stop icon
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="5" y="5" width="14" height="14" rx="2" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="text-center mt-2 md:mt-3">
                    <p className="text-[9px] md:text-[10px] text-gray-600 uppercase tracking-tighter">
                        LexMind có thể mắc sai sót
                    </p>
                </div>
            </div>

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
