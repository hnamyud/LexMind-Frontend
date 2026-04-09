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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#ec5b13]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8 p-8 md:p-12 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-red-400/10 border border-red-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-[#ec5b13] text-transparent bg-clip-text drop-shadow-sm">
            Hệ thống gián đoạn
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-lg mx-auto">
            Đã xảy ra một lỗi bất ngờ trong quá trình xử lý yêu cầu của bạn. Đội ngũ kỹ thuật đã được thông báo.
          </p>
          
          <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-left overflow-hidden">
            <p className="text-sm font-mono text-red-400/80 break-words opacity-80">
              <span className="text-zinc-500">Error: </span>
              {error.message || "Unknown Application Error"}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-black bg-gradient-to-r from-[#00f2ff] to-[#00b4d2] rounded-full hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
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
