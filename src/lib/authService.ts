import { apiClient, refreshAccessToken, clearTokens, setAccessToken } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// ==================== Types ====================

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface SendOtpPayload {
    email: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string; // 6 chữ số
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user?: User;
    message?: string;
    [key: string]: unknown;
}

export interface RegisterResponse {
    message: string;
    user?: User;
    [key: string]: unknown;
}

export interface ProfileResponse {
    message: string;
    user?: User;
    data?: User;
    [key: string]: unknown;
}

export interface LogoutResponse {
    message: string;
}

export interface MessageResponse {
    message: string;
    [key: string]: unknown;
}

// ==================== Auth Service ====================

export const authService = {
    // ─── 1. Login ──────────────────────────────────────────────────────────
    async login(payload: LoginPayload): Promise<LoginResponse> {
        const data = await apiClient.post<LoginResponse>("/auth/login", payload);
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken as string);
        return data;
    },

    // ─── 2. Register ───────────────────────────────────────────────────────
    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        return apiClient.post<RegisterResponse>("/auth/register", payload);
    },

    // ─── 3. Profile ────────────────────────────────────────────────────────
    async getProfile(): Promise<ProfileResponse> {
        return apiClient.get<ProfileResponse>("/auth/profile", true);
    },

    // ─── 4. Logout ─────────────────────────────────────────────────────────
    async logout(): Promise<LogoutResponse> {
        try {
            return await apiClient.post<LogoutResponse>("/auth/logout", {}, true);
        } finally {
            clearTokens();
        }
    },

    // ─── 4.5. Refresh Token ────────────────────────────────────────────────
    /**
     * GET /refresh
     * Dùng cookie refresh_token để lấy accessToken mới.
     * Được gọi tự động bởi apiClient khi gặp 401, hoặc gọi thủ công khi F5.
     */
    async refresh(): Promise<{ accessToken: string; user?: User }> {
        const data = await refreshAccessToken();
        return { accessToken: data };
    },

    /**
     * Lưu accessToken mới vào localStorage (dùng sau khi refresh thành công).
     */
    saveAccessToken(token: string): void {
        setAccessToken(token);
    },

    // ─── 5. Google OAuth ───────────────────────────────────────────────────
    /**
     * Redirect trình duyệt đến Google OAuth flow.
     * Backend sẽ redirect về FE kèm token sau khi xác thực thành công.
     */
    redirectToGoogle(): void {
        window.location.href = `${BASE_URL}/auth/google/login`;
    },

    /**
     * Sau khi Google callback redirect về FE (ví dụ: /auth/callback?token=xxx),
     * lưu token vào localStorage.
     */
    handleGoogleCallback(accessToken: string, refreshToken?: string): void {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    },

    // ─── 6. Send OTP (Quên mật khẩu) ──────────────────────────────────────
    async sendOtp(payload: SendOtpPayload): Promise<MessageResponse> {
        return apiClient.post<MessageResponse>("/mail/reset-password", payload);
    },

    // ─── 7. Verify OTP ─────────────────────────────────────────────────────
    async verifyOtp(payload: VerifyOtpPayload): Promise<MessageResponse> {
        return apiClient.post<MessageResponse>("/auth/verify-otp", payload);
    },

    // ─── 8. Reset Password ─────────────────────────────────────────────────
    async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
        return apiClient.post<MessageResponse>("/auth/reset-password", payload);
    },

    // ─── 9. Change Password (đã đăng nhập) ─────────────────────────────────
    async changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
        return apiClient.post<MessageResponse>("/auth/change-password", payload, true);
    },

    // ─── Helpers ───────────────────────────────────────────────────────────
    isAuthenticated(): boolean {
        if (typeof window === "undefined") return false;
        return !!localStorage.getItem("accessToken");
    },

    getToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("accessToken");
    },
};
