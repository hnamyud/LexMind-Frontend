import { apiClient } from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Conversation {
    id: string;
    title: string;
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationListResponse {
    result?: Conversation[];
    data?: Conversation[]; // for backup
    meta: {
        current: number;
        pageSize: number;
        pages?: number;
        totalPages?: number;
        total?: number;
    };
    message?: string;
    [key: string]: unknown;
}

export interface UpdateConversationPayload {
    title: string;
    summary?: string;
}

// ─── Conversation Service ──────────────────────────────────────────────────────
export const conversationService = {
    /** GET /conversations?current=&pageSize= */
    async getAll(current = 1, pageSize = 20): Promise<ConversationListResponse> {
        return apiClient.get<ConversationListResponse>(
            `/conversations?current=${current}&pageSize=${pageSize}`,
            true
        );
    },

    /** PUT /conversations/:id */
    async update(id: string, payload: UpdateConversationPayload): Promise<Conversation> {
        return apiClient.put<Conversation>(`/conversations/${id}`, payload, true);
    },

    /** DELETE /conversations/:id */
    async delete(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/conversations/${id}`, true);
    },
};
