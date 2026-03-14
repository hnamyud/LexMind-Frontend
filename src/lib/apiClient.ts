const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080/api/v1";

export const GOOGLE_LOGIN_URL = `${BASE_URL}/auth/google/login`;

// ─── TransformInterceptor unwrap ─────────────────────────────────────────────
interface WrappedResponse<T> {
    statusCode?: number;
    message?: string;
    data?: T;
}

function unwrap<T>(raw: unknown): T {
    if (
        raw !== null &&
        typeof raw === "object" &&
        "data" in raw &&
        (raw as WrappedResponse<T>).data !== undefined
    ) {
        const wrapped = raw as WrappedResponse<T>;
        if (wrapped.data && typeof wrapped.data === "object") {
            return { message: wrapped.message, ...wrapped.data } as T;
        }
        return wrapped.data as T;
    }
    return raw as T;
}

// ─── Error ───────────────────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(
        public status: number,
        public override message: string,
        public data?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// ─── Token helpers ───────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
}

export function clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

// ─── Refresh lock (chống nhiều request đồng thời gọi refresh) ────────────────
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "GET",
        credentials: "include", // Gửi cookie refresh_token
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        clearTokens();
        throw new ApiError(response.status, "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
    }

    const raw = await response.json();
    const data = unwrap<{ accessToken: string }>(raw);

    if (!data.accessToken) {
        clearTokens();
        throw new ApiError(401, "Không nhận được access token mới.");
    }

    setAccessToken(data.accessToken);
    return data.accessToken;
}

/** Refresh token, chỉ 1 lần dù nhiều request cùng gọi song song */
export async function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

// ─── Core request ────────────────────────────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {},
    authenticated = false,
    _isRetry = false      // tránh vòng lặp vô tận khi tự retry
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (authenticated) {
        const token = getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include", // Luôn gửi cookie để refresh_token được đính kèm
    });

    let raw: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        raw = await response.json();
    } else {
        raw = await response.text();
    }

    // ── 401: thử refresh token rồi retry 1 lần ──────────────────────────────
    if (response.status === 401 && authenticated && !_isRetry) {
        try {
            const newToken = await refreshAccessToken();
            // Retry request với token mới
            return request<T>(
                path,
                {
                    ...options,
                    headers: {
                        ...(options.headers as Record<string, string>),
                        Authorization: `Bearer ${newToken}`,
                    },
                },
                authenticated,
                true // đánh dấu đây là lần retry
            );
        } catch {
            // Refresh thất bại → ném lỗi để component xử lý (logout)
            throw new ApiError(401, "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.", raw);
        }
    }

    if (!response.ok) {
        const msg =
            (raw as WrappedResponse<unknown>)?.message ??
            (raw as { message?: string })?.message ??
            `Request failed with status ${response.status}`;
        throw new ApiError(response.status, msg, raw);
    }

    return unwrap<T>(raw);
}

// ─── Public client ────────────────────────────────────────────────────────────
export const apiClient = {
    get: <T>(path: string, authenticated = false) =>
        request<T>(path, { method: "GET" }, authenticated),

    post: <T>(path: string, body: unknown, authenticated = false) =>
        request<T>(
            path,
            { method: "POST", body: JSON.stringify(body) },
            authenticated
        ),

    put: <T>(path: string, body: unknown, authenticated = false) =>
        request<T>(
            path,
            { method: "PUT", body: JSON.stringify(body) },
            authenticated
        ),

    delete: <T>(path: string, authenticated = false) =>
        request<T>(path, { method: "DELETE" }, authenticated),
};
