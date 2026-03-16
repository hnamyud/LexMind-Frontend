import { apiClient } from "./apiClient";

export interface ChatMessageSource {
    type: string;
    id?: string;
    score?: number;
    url?: string;
}

export interface ChatMessage {
    id: string;
    content: string;
    sender: "bot" | "user";
    createdAt: string;
    thought?: string | null;
    metadata?: {
        sources?: ChatMessageSource[];
    } | null;
}

export interface MessageListResponse {
    result?: ChatMessage[];
    data?: ChatMessage[];
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

export const messageService = {
    /** GET /messages?conversationId=&current=&pageSize= */
    async getMessagesByConversation(
        conversationId: string,
        current = 1,
        pageSize = 50
    ): Promise<MessageListResponse> {
        return apiClient.get<MessageListResponse>(
            `/messages?conversationId=${conversationId}&current=${current}&pageSize=${pageSize}`,
            true
        );
    },
};
