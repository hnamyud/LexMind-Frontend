"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { chatService, StreamChunk, StepChunk } from "@/lib/chatService";
import { messageService } from "@/lib/messageService";
import { useAuthStore } from "@/store/authStore";
import { useAuthHasHydrated } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MessageStep {
    step: number;
    node: string;
    label: string;
}

interface Source {
    type: string;
    id: string;
    score: number;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;           // nội dung chính (answer)
    thinking?: string;         // nội dung thinking (ẩn/hiện)
    steps?: MessageStep[];     // các bước đang xử lý
    currentProcess?: string;   // nội dung quá trình LLM đang xử lý (type: process)
    sources?: Source[];
    streaming?: boolean;       // đang stream
    error?: string;
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

/** Bubble tin nhắn AI */
function AiMessage({
    msg,
    onRegenerate,
}: {
    msg: Message;
    onRegenerate?: (id: string) => void;
}) {
    const lastStep = msg.steps?.[msg.steps.length - 1];

    return (
        <div className="flex flex-col items-start">
            <div className="ai-glow bg-ai-bubble text-gray-200 px-5 py-4 rounded max-w-[90%] text-sm leading-relaxed border border-gray-800">
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
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.streaming && !msg.currentProcess && (
                                <span className="inline-block w-1.5 h-4 bg-brand ml-0.5 animate-pulse align-middle" />
                            )}
                        </div>
                        {msg.streaming && msg.currentProcess && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:300ms]" />
                                <span className="text-[11px] text-gray-500 font-mono flex-1">{msg.currentProcess}</span>
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
                        {msg.currentProcess && (
                            <span className="text-[11px] text-gray-500 font-mono">{msg.currentProcess}</span>
                        )}
                    </div>
                ) : null}

                {/* Error */}
                {msg.error && (
                    <p className="text-xs text-red-400 mt-2">{msg.error}</p>
                )}

                {/* Sources */}
                {!msg.streaming && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Nguồn tham chiếu</p>
                        <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, idx) => (
                                <span
                                    key={`src-${src.id}-${idx}`}
                                    className="px-2 py-0.5 text-[10px] rounded border border-gray-700 text-gray-500 font-mono"
                                >
                                    {src.id}
                                    <span className="ml-1 text-brand/60">
                                        {(src.score * 100).toFixed(0)}%
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 mt-1 ml-1">
                <span className="text-[10px] text-brand uppercase tracking-widest font-bold">LexMind</span>
                {!msg.streaming && msg.content && onRegenerate && (
                    <button
                        onClick={() => onRegenerate(msg.id)}
                        className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
                        title="Tạo lại câu trả lời"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Tạo lại
                    </button>
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
                        content: m.content
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
        if (hasHydrated && !accessToken) router.push("/login");
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
            thinking: "",
            streaming: true,
        };

        setMessages((prev) => [...prev, userMsg, aiMsg]);

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
                            updateLastMessage((msg) => ({
                                ...msg,
                                currentProcess: (chunk as any).message || (chunk as any).label || (chunk as any).content || (chunk as any).node || "Đang xử lý..."
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
                // User chủ động hủy — đấu streaming: false, giữ lại content đã có
                updateLastMessage((msg) => ({ ...msg, streaming: false }));
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
                            msg.currentProcess = (chunk as any).message || (chunk as any).label || (chunk as any).content || (chunk as any).node || "Đang xử lý...";
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
                    copy[idx] = { ...copy[idx], streaming: false };
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
                <div className="flex flex-col items-center justify-center py-8 px-4 md:py-12 md:px-6">
                    <div className="max-w-max text-center">
                        <h1 className="typing-effect text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                            LexMind: Advanced Legal Intelligence.
                        </h1>
                    </div>
                    <p className="mt-4 text-gray-500 text-sm md:text-base font-medium">
                        Sophisticated legal reasoning at your fingertips.
                    </p>
                </div>
            )}

            {/* Chat Stream */}
            <section
                ref={chatStreamRef}
                className="chat-stream flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-6 md:space-y-8 max-w-4xl mx-auto w-full pb-32"
            >
                {isLoadingHistory ? (
                    <div className="flex justify-center py-10">
                        <span className="text-gray-500 animate-pulse text-sm tracking-widest uppercase">Đang tải lịch sử...</span>
                    </div>
                ) : (
                    messages.map((msg) =>
                        msg.role === "user" ? (
                            // User bubble
                            <div key={msg.id} className="flex flex-col items-end">
                                <div className="bg-user-bubble text-gray-200 px-4 py-3 rounded max-w-[90%] sm:max-w-[80%] text-sm leading-relaxed border border-gray-700 whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest mr-1">Bạn</span>
                            </div>
                        ) : (
                            // AI bubble
                            <AiMessage key={msg.id} msg={msg} onRegenerate={handleRegenerate} />
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
                        className="w-full bg-[#161616] border border-gray-800 text-gray-200 text-[15px] py-3 pl-4 pr-12 md:py-4 md:pl-5 md:pr-14 focus:outline-none focus:border-brand focus:ring-0 rounded transition-all resize-none disabled:opacity-50 leading-relaxed"
                        placeholder="Hỏi LexMind..."
                        style={{ minHeight: 48, maxHeight: 120 }}
                    />
                    <button
                        onClick={isStreaming ? handleCancel : () => handleSend(input)}
                        disabled={!isStreaming && !input.trim()}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-all rounded ${
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
                        Powered by LexiLLM V2.4 Pro · Giới hạn 5 câu hỏi / phút
                    </p>
                </div>
            </div>
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
