import { getAccessToken, refreshAccessToken, ApiError } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StepChunk {
    type: "step";
    step: number;
    node: string;
    label: string;
}

export interface ThinkingChunk {
    type: "thinking";
    content: string;
}

export interface AnswerChunk {
    type: "answer";
    content: string;
}

export interface MetadataChunk {
    type: "metadata";
    content: {
        sources: { type: string; id: string; score: number }[];
    };
}

export interface DoneChunk {
    type: "done";
}

export interface InfoChunk {
    type: "info";
    conversationId: string;
}

export interface ProcessChunk {
    type: "process";
    content: string;
}

export interface MessageIdChunk {
    type: "message_id";
    messageId: string;
}

export type StreamChunk = StepChunk | ThinkingChunk | AnswerChunk | MetadataChunk | ProcessChunk | InfoChunk | MessageIdChunk | DoneChunk;

export interface AskPayload {
    question: string;
    conversationId?: string;
}

// ─── SSE Stream reader ────────────────────────────────────────────────────────
async function readStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // giữ lại dòng chưa hoàn chỉnh

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const raw = trimmed.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;

            try {
                const parsed = JSON.parse(raw) as StreamChunk;
                onChunk(parsed);
            } catch {
                // Bỏ qua dòng không parse được
            }
        }
    }
}

// ─── Authenticated fetch với auto-refresh ────────────────────────────────────
async function authFetch(url: string, init: RequestInit, isRetry = false): Promise<Response> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { ...init, headers, credentials: "include" });

    if (response.status === 401 && !isRetry) {
        try {
            const newToken = await refreshAccessToken();
            return authFetch(
                url,
                { ...init, headers: { ...headers, Authorization: `Bearer ${newToken}` } },
                true
            );
        } catch {
            throw new ApiError(401, "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        }
    }

    if (!response.ok) {
        let msg = `Request failed: ${response.status}`;
        try {
            const err = await response.json();
            msg = err?.message ?? msg;
        } catch { /* ignore */ }
        throw new ApiError(response.status, msg);
    }

    return response;
}

// ─── Chat Service ─────────────────────────────────────────────────────────────
export const chatService = {
    /**
     * POST /chat/ask/stream
     * Gửi câu hỏi và nhận stream SSE.
     */
    async askStream(
        payload: AskPayload,
        onChunk: (chunk: StreamChunk) => void
    ): Promise<void> {
        const response = await authFetch(`${BASE_URL}/chat/ask/stream`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        await readStream(response, onChunk);
    },

    /**
     * POST /chat/regenerate/:messageId
     * Tạo lại câu trả lời cho 1 tin nhắn cụ thể.
     */
    async regenerateStream(
        messageId: string,
        onChunk: (chunk: StreamChunk) => void
    ): Promise<void> {
        const response = await authFetch(`${BASE_URL}/chat/regenerate/${messageId}`, {
            method: "POST",
            body: JSON.stringify({}),
        });
        await readStream(response, onChunk);
    },
};
