"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[var(--danger-soft)] blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--legal-soft)] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8 p-8 md:p-12 rounded-3xl border border-[var(--border-primary)] bg-[var(--surface-glass)] backdrop-blur-xl shadow-[var(--shadow-panel)]">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-[var(--danger-soft)] border border-[var(--danger-border)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse text-[var(--danger)]"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "0 0 30px var(--danger-border)" }} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--danger)] drop-shadow-sm">
            Hệ thống gián đoạn
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
            Đã xảy ra một lỗi bất ngờ trong quá trình xử lý yêu cầu của bạn. Đội ngũ kỹ thuật đã được thông báo.
          </p>
          
          <div className="mt-4 p-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-primary)] text-left overflow-hidden">
            <p className="text-sm font-mono text-[var(--danger)] break-words opacity-80">
              <span className="text-[var(--text-muted)]">Error: </span>
              {error.message || "Unknown Application Error"}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--surface-container-high)] border border-[var(--border-primary)] rounded-full hover:bg-[var(--bg-hover)] transition-all duration-300 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Thử lại
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-[var(--md-sys-color-on-primary)] bg-[var(--md-sys-color-primary)] rounded-full transition-all duration-300 hover:brightness-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
