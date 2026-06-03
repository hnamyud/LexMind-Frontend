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
    const hasInput = input.trim().length > 0;

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
        <div
            className="absolute bottom-0 left-0 w-full shrink-0 px-3 pt-6 md:px-6"
            style={{
                paddingBottom: "calc(0.75rem + var(--safe-area-bottom))",
                background: "linear-gradient(180deg, transparent, var(--bg-main) 18%, var(--bg-main))",
            }}
        >
            <div className="relative mx-auto max-w-4xl">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isStreaming}
                    className={`chat-input-scroll w-full resize-none rounded-[28px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] py-3.5 pl-4 pr-14 text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] shadow-[var(--shadow-panel)] transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface-container)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-state-focus)] disabled:opacity-50 md:rounded-[30px] md:py-5 md:pl-6 md:pr-16 ${isOverflowing ? 'overflow-y-auto' : 'overflow-hidden'}`}
                    placeholder="Hỏi LexMind..."
                    style={{
                        minHeight: 56, maxHeight: 240,
                    }}
                />
                <button
                    onClick={handleSendClick}
                    disabled={!isStreaming && !hasInput}
                    className={`absolute bottom-2.5 right-2.5 rounded-full p-2 shadow-sm transition-all md:bottom-4 md:right-4 md:p-2.5 ${isStreaming
                            ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                            : hasInput
                                ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-[var(--shadow-bubble)] hover:brightness-105"
                                : "bg-[var(--md-sys-color-surface-container)] text-[var(--text-faint)] disabled:cursor-not-allowed disabled:opacity-60"
                        }`}
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
            <div className="mt-2 text-center md:mt-3">
                <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    LexMind có thể mắc sai sót
                </p>
            </div>
        </div>
    );
});

ChatInput.displayName = "ChatInput";
