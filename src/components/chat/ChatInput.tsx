"use client";

import React, { useRef, useState, useEffect } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onCancel: () => void;
    isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = React.memo(({ onSend, onCancel, isStreaming }) => {
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            const currentScrollHeight = inputRef.current.scrollHeight;
            inputRef.current.style.height = `${currentScrollHeight}px`;
            setIsOverflowing(currentScrollHeight >= 240);
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isStreaming && input.trim()) {
                onSend(input);
                setInput("");
            }
        }
    };

    const handleSendClick = () => {
        if (isStreaming) {
            onCancel();
        } else if (input.trim()) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <div className="p-4 md:p-6 shrink-0 w-full absolute bottom-0 left-0 pb-2 md:pb-6" style={{ backgroundColor: 'var(--bg-main)' }}>
            <div className="max-w-4xl mx-auto relative group">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isStreaming}
                    className={`w-full text-[15px] py-3 pl-4 pr-12 md:py-4 md:pl-5 md:pr-14 focus:outline-none focus:ring-0 rounded-xl transition-colors resize-none disabled:opacity-50 leading-relaxed chat-input-scroll placeholder:text-[var(--text-secondary)] placeholder:opacity-100 focus:placeholder:opacity-60 ${isOverflowing ? 'overflow-y-auto' : 'overflow-hidden'}`}
                    placeholder="Hỏi LexMind..."
                    style={{
                        minHeight: 48, maxHeight: 240,
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                    }}
                />
                <button
                    onClick={handleSendClick}
                    disabled={!isStreaming && !input.trim()}
                    className={`absolute right-3 bottom-2.5 md:bottom-3 p-2 transition-all rounded ${isStreaming
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "disabled:opacity-30 disabled:cursor-not-allowed"
                        }`}
                    style={{ color: isStreaming ? undefined : 'var(--text-muted)' }}
                    type="button"
                    title={isStreaming ? "Hủy đánh máy (Escape)" : "Gửi (Enter)"}
                >
                    {isStreaming ? (
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
                <p className="text-[9px] md:text-[10px] uppercase tracking-tighter" style={{ color: 'var(--text-faint)' }}>
                    LexMind có thể mắc sai sót
                </p>
            </div>
        </div>
    );
});
