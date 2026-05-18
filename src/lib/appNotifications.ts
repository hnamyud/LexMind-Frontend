"use client";

export type AppNotificationVariant = "info" | "success" | "warning" | "error";

export interface AppNotificationDetail {
    title: string;
    message: string;
    variant?: AppNotificationVariant;
    actionLabel?: string;
    actionHref?: string;
}

export const APP_NOTIFICATION_EVENT = "lexmind:notification";
export const AUTH_EXPIRED_EVENT = "lexmind:auth-expired";

export function notifyApp(detail: AppNotificationDetail): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<AppNotificationDetail>(APP_NOTIFICATION_EVENT, { detail }));
}

export function notifyAuthExpired(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

export function getCommonErrorNotification(status: number, message?: string): AppNotificationDetail {
    if (status === 401) {
        return {
            title: "Phiên đăng nhập đã hết hạn",
            message: "Vui lòng đăng nhập lại để tiếp tục sử dụng LexMind.",
            variant: "warning",
            actionLabel: "Đăng nhập",
            actionHref: "/login?reason=session-expired",
        };
    }

    if (status === 403) {
        return {
            title: "Không đủ quyền truy cập",
            message: "Tài khoản hiện tại không có quyền thực hiện thao tác này.",
            variant: "warning",
        };
    }

    if (status === 404) {
        return {
            title: "Không tìm thấy dữ liệu",
            message: message || "Tài nguyên bạn yêu cầu không tồn tại hoặc đã bị xóa.",
            variant: "warning",
        };
    }

    if (status === 429) {
        return {
            title: "Quá nhiều yêu cầu",
            message: "Hệ thống đang nhận quá nhiều thao tác. Vui lòng thử lại sau ít phút.",
            variant: "warning",
        };
    }

    if (status >= 500) {
        return {
            title: "Máy chủ đang gặp sự cố",
            message: "Yêu cầu chưa được xử lý thành công. Vui lòng thử lại sau.",
            variant: "error",
        };
    }

    return {
        title: "Không thể hoàn tất yêu cầu",
        message: message || "Đã xảy ra lỗi trong quá trình xử lý.",
        variant: "error",
    };
}

export function notifyHttpError(status: number, message?: string): void {
    notifyApp(getCommonErrorNotification(status, message));
    if (status === 401) notifyAuthExpired();
}

export function notifyNetworkError(): void {
    notifyApp({
        title: "Không thể kết nối máy chủ",
        message: "Kiểm tra kết nối mạng hoặc trạng thái backend rồi thử lại.",
        variant: "error",
    });
}
