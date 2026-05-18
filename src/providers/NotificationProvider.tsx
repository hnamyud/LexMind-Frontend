"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    APP_NOTIFICATION_EVENT,
    AppNotificationDetail,
    AppNotificationVariant,
} from "@/lib/appNotifications";

interface Toast extends AppNotificationDetail {
    id: string;
    variant: AppNotificationVariant;
}

const variantStyles: Record<AppNotificationVariant, { icon: string; accent: string; bg: string }> = {
    info: { icon: "info", accent: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)" },
    success: { icon: "check_circle", accent: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
    warning: { icon: "warning", accent: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
    error: { icon: "error", accent: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
};

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<AppNotificationDetail>).detail;
            if (!detail?.title || !detail?.message) return;

            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const toast: Toast = {
                ...detail,
                id,
                variant: detail.variant ?? "info",
            };

            setToasts((current) => {
                const withoutDuplicate = current.filter(
                    (item) => item.title !== toast.title || item.message !== toast.message
                );
                return [toast, ...withoutDuplicate].slice(0, 4);
            });

            window.setTimeout(() => dismiss(id), 6500);
        };

        window.addEventListener(APP_NOTIFICATION_EVENT, handler);
        return () => window.removeEventListener(APP_NOTIFICATION_EVENT, handler);
    }, [dismiss]);

    const toastList = useMemo(() => toasts, [toasts]);

    return (
        <>
            {children}
            <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 pointer-events-none">
                {toastList.map((toast) => {
                    const style = variantStyles[toast.variant];
                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto rounded-lg border p-3 shadow-2xl backdrop-blur-xl"
                            style={{
                                backgroundColor: "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
                                borderColor: "var(--border-primary)",
                                color: "var(--text-primary)",
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded"
                                    style={{ backgroundColor: style.bg, color: style.accent }}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold leading-5">{toast.title}</p>
                                    <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                                        {toast.message}
                                    </p>
                                    {toast.actionHref && toast.actionLabel && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                dismiss(toast.id);
                                                router.push(toast.actionHref!);
                                            }}
                                            className="mt-2 text-xs font-semibold uppercase tracking-widest"
                                            style={{ color: style.accent }}
                                        >
                                            {toast.actionLabel}
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => dismiss(toast.id)}
                                    className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                                    aria-label="Đóng thông báo"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
