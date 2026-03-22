import { apiClient } from "./apiClient";

export const feedbackService = {
    /**
     * Gửi phản hồi đánh giá cho tin nhắn từ AI.
     * @param messageId ID của tin nhắn
     * @param isLike true (Like) / false (Dislike)
     * @param reason Lý do chọn (tùy chọn)
     */
    async submitFeedback(messageId: string, isLike: boolean, reason?: string): Promise<any> {
        return apiClient.post(
            `/feedbacks/message/${messageId}`,
            { isLike, reason },
            true // Gửi JWT token
        );
    },
};
