"use client";

import React, { useState } from "react";

const FEEDBACK_OPTIONS = [
  "AI trả lời không đúng bối cảnh pháp lý Việt Nam.",
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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customReason.trim() || "Khác");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-[var(--shadow-panel)]"
        style={{ animation: "fadeIn 0.2s ease-out forwards" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Điều gì chưa đúng?</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            title="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="chat-input-scroll max-h-[70vh] space-y-1 overflow-y-auto p-2">
          <p className="px-3 pb-3 pt-2 text-sm text-[var(--text-secondary)]">
            Phản hồi của bạn giúp LexMind cải thiện chất lượng câu trả lời và citation.
          </p>

          {!isOther ? (
            <>
              {FEEDBACK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onSubmit(opt)}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)]"
                >
                  {opt}
                </button>
              ))}
              <button
                onClick={() => setIsOther(true)}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)]"
              >
                Khác
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Mô tả ngắn vấn đề bạn gặp phải..."
                rows={4}
                autoFocus
                className="chat-input-scroll w-full resize-none rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOther(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={!customReason.trim()}
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
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
