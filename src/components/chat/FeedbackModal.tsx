"use client";

import React, { useState } from "react";

const FEEDBACK_OPTIONS = [
    "AI trả lời không đúng bối cảnh pháp lý của Việt Nam.",
    "Câu trả lời không đúng sự thật.",
    "Thông tin cung cấp không đầy đủ.",
    "LexMind không hiểu đúng ý câu hỏi.",
];

export default function FeedbackModal({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (reason: string) => void;
}) {
    const [isOther, setIsOther] = useState(false);
    const [customReason, setCustomReason] = useState("");

    const handleSelectOption = (reason: string) => {
        onSubmit(reason);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(customReason.trim() || "Khác");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                style={{
                    animation: "fadeIn 0.2s ease-out forwards",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-gray-200">Đã xảy ra lỗi gì?</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        title="Đóng modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto chat-input-scroll">
                    <p className="px-3 pt-2 pb-3 text-sm text-gray-400">
                        Ý kiến phản hồi của bạn sẽ giúp cải thiện LexMind cho tất cả mọi người.
                    </p>

                    {!isOther ? (
                        <>
                            {FEEDBACK_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelectOption(opt)}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                                >
                                    {opt}
                                </button>
                            ))}
                            <button
                                onClick={() => setIsOther(true)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                            >
                                Khác
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="p-3">
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Hãy cho chúng tôi biết vấn đề bạn gặp phải..."
                                rows={4}
                                autoFocus
                                className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-300 text-sm p-3 focus:outline-none focus:border-brand rounded transition-colors resize-none chat-input-scroll"
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOther(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={!customReason.trim()}
                                    className="px-4 py-2 text-sm font-bold bg-brand text-black rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                >
                                    Gửi phản hồi
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
