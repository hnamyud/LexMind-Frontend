import { apiClient } from "./apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StatsQuery {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: "hour" | "day" | "week" | "month";
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "ASC" | "DESC";
}

// Health
export interface ServiceHealth {
    status: string;
    responseTime: number;
}

export interface HealthResponse {
    status: string;
    timestamp: string;
    services: {
        database: ServiceHealth;
        aiService: ServiceHealth;
        redis: ServiceHealth;
    };
}

// System Stats
export interface SystemStatsResponse {
    activeUsers: { last24h: number; last7d: number; last30d: number };
    requestRate: { messagesLast24h: number; messagesLast7d: number; avgMessagesPerDay: number };
    errorRate: { last24h: { total: number; percentage: number }; last7d: { total: number; percentage: number } };
    performance: { avgResponseTime: number; slowRequests24h: number; slowRequestsPercentage: number };
}

// Feedbacks
export interface FeedbackItem {
    id: string;
    messageId: string;
    userId: string;
    user: { id: string; fullName: string; email: string };
    message: {
        content: string;
        question: string;
        conversation: { id: string; title: string };
        aiMetrics: { responseTime: number; model: string };
    };
    isLike: boolean;
    reason: string | null;
    createdAt: string;
}

export interface FeedbacksResponse {
    data: FeedbackItem[];
    total: number;
    stats: { totalLikes: number; totalDislikes: number; likeRatio: number };
}

export interface FeedbackAnalyticsResponse {
    overview: {
        totalFeedbacks: number;
        feedbackRate: number;
        likeCount: number;
        dislikeCount: number;
        likeRatio: number;
        qualityScore: number;
    };
    dislikeReasons: { reason: string; count: number }[];
    feedbackByResponseTime: { responseTimeRange: string; totalMessages: number; likeRatio: number }[];
}

// AI Performance
export interface AIPerformanceResponse {
    overview: {
        avgResponseTime: number;
        p50ResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        avgTTFT: number;
        totalCost: number;
        avgCostPerMessage: number;
    };
    modelDistribution: { model: string; count: number; avgTime: number }[];
    tokenUsage: { totalInputTokens: number; totalOutputTokens: number; avgInputTokensPerMessage: number };
}

export interface AIErrorItem {
    messageId: string;
    errorType: string;
    errorMessage: string;
    question: string;
    timestamp: string;
    metadata: { model: string; retryCount: number };
}

export interface AIErrorsResponse {
    data: AIErrorItem[];
    total: number;
    errorsByType: { type: string; count: number }[];
}

// AI Cache
export interface AICacheResponse {
    overview: {
        totalQueries: number;
        cacheHits: number;
        cacheMisses: number;
        hitRatePercent: number;
        avgTimeSavedMs: number;
        totalTimeSavedMs: number;
    };
    responseTimeComparison: {
        cached: { avg: number; p50: number; p95: number };
        nonCached: { avg: number; p50: number; p95: number };
    };
    timeSeries: { date: string; hits: number; misses: number; hitRate: number }[];
}

// Users
export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    stats: { conversationCount: number; feedbackCount: number; lastActiveAt: string };
}

export interface UsersResponse {
    data: AdminUser[];
    total: number;
    page: number;
    limit: number;
}

export interface UserDetailResponse {
    id: string;
    email: string;
    fullName: string;
    role: string;
    stats: {
        totalConversations: number;
        totalFeedbacks: number;
        likeFeedbacks: number;
        dislikeFeedbacks: number;
        avgMessagesPerConversation: number;
        lastActiveAt: string;
    };
    recentConversations: { id: string; title: string; messageCount: number; createdAt: string }[];
}

// Conversations
export interface AdminConversation {
    id: string;
    title: string;
    userId: string;
    user: { fullName: string };
    messageCount: number;
    avgResponseTime: number;
    hasNegativeFeedback: boolean;
    createdAt: string;
}

export interface ConversationsResponse {
    data: AdminConversation[];
    total: number;
    page: number;
    limit: number;
}

export interface ConversationDetailResponse {
    id: string;
    title: string;
    userId: string;
    user: { id: string; email: string };
    messages: {
        id: string;
        sender: "user" | "bot";
        content: string;
        createdAt: string;
        aiMetrics?: { totalTime: number; cost: number };
        feedback?: { isLike: boolean; reason: string | null };
    }[];
    stats: {
        totalMessages: number;
        avgResponseTime: number;
        totalCost: number;
        feedbackCount: number;
        likeFeedbacks: number;
        dislikeFeedbacks: number;
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toQueryString(params: Record<string, any>): string {
    const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
    return qs ? `?${qs}` : "";
}

// ─── Admin Service ───────────────────────────────────────────────────────────

export const adminService = {
    // ── System Monitoring ────────────────────────────────────────────────────
    async getHealth(): Promise<HealthResponse> {
        return apiClient.get<HealthResponse>("/admin/health", true);
    },

    async getSystemStats(): Promise<SystemStatsResponse> {
        return apiClient.get<SystemStatsResponse>("/admin/system/stats", true);
    },

    // ── Feedbacks ────────────────────────────────────────────────────────────
    async getFeedbacks(params: PaginationQuery & { isLike?: boolean; userId?: string; conversationId?: string; search?: string; dateFrom?: string; dateTo?: string } = {}): Promise<FeedbacksResponse> {
        return apiClient.get<FeedbacksResponse>(`/admin/feedbacks${toQueryString(params)}`, true);
    },

    async getFeedbackAnalytics(params: StatsQuery = {}): Promise<FeedbackAnalyticsResponse> {
        return apiClient.get<FeedbackAnalyticsResponse>(`/admin/feedbacks/analytics${toQueryString(params)}`, true);
    },

    // ── AI Performance & Errors ──────────────────────────────────────────────
    async getAIPerformance(params: StatsQuery = {}): Promise<AIPerformanceResponse> {
        return apiClient.get<AIPerformanceResponse>(`/admin/ai/performance${toQueryString(params)}`, true);
    },

    async getAIQuality(params: StatsQuery = {}): Promise<unknown> {
        return apiClient.get(`/admin/ai/quality${toQueryString(params)}`, true);
    },

    async getAICache(params: Pick<StatsQuery, 'dateFrom' | 'dateTo'> = {}): Promise<AICacheResponse> {
        return apiClient.get<AICacheResponse>(`/admin/ai/cache${toQueryString(params)}`, true);
    },

    async getAIErrors(params: PaginationQuery & { errorCode?: string; dateFrom?: string; dateTo?: string } = {}): Promise<AIErrorsResponse> {
        return apiClient.get<AIErrorsResponse>(`/admin/ai/errors${toQueryString(params)}`, true);
    },

    // ── Users ────────────────────────────────────────────────────────────────
    async getUsers(params: PaginationQuery & { role?: string; search?: string } = {}): Promise<UsersResponse> {
        return apiClient.get<UsersResponse>(`/admin/users${toQueryString(params)}`, true);
    },

    async getUserDetail(userId: string): Promise<UserDetailResponse> {
        return apiClient.get<UserDetailResponse>(`/admin/users/${userId}`, true);
    },

    // ── Conversations ────────────────────────────────────────────────────────
    async getConversations(params: PaginationQuery & { userId?: string; dateFrom?: string; dateTo?: string; hasNegativeFeedback?: boolean } = {}): Promise<ConversationsResponse> {
        return apiClient.get<ConversationsResponse>(`/admin/conversations${toQueryString(params)}`, true);
    },

    async getConversationStats(params: StatsQuery = {}): Promise<unknown> {
        return apiClient.get(`/admin/conversations/stats${toQueryString(params)}`, true);
    },

    async getConversationDetail(id: string): Promise<ConversationDetailResponse> {
        return apiClient.get<ConversationDetailResponse>(`/admin/conversations/${id}`, true);
    },
};
