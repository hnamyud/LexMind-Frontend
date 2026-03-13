import { apiClient } from "./apiClient";

export interface ChatMessage {
    id: string;
    content: string;
    sender: "bot" | "user";
    createdAt: string;
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
