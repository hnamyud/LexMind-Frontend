"use client";

import { create } from "zustand";
import {
    conversationService,
    Conversation,
    UpdateConversationPayload,
} from "@/lib/conversationService";

interface ConversationState {
    conversations: Conversation[];
    activeId: string | null;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    currentPage: number;

    // Actions
    fetchConversations: (page?: number) => Promise<void>;
    loadMore: () => Promise<void>;
    setActiveId: (id: string | null) => void;
    addConversation: (conv: Conversation) => void;
    updateConversation: (id: string, payload: UpdateConversationPayload) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useConversationStore = create<ConversationState>()((set, get) => ({
    conversations: [],
    activeId: null,
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,

    fetchConversations: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const res = await conversationService.getAll(page, 20);
            const list: Conversation[] = Array.isArray(res.result)
                ? res.result
                : Array.isArray(res.data)
                ? res.data
                : Array.isArray(res)
                ? (res as unknown as Conversation[])
                : [];
            const meta = res.meta;
            set({
                conversations: page === 1 ? list : [...get().conversations, ...list],
                currentPage: page,
                hasMore: meta ? page < (meta.pages ?? meta.totalPages ?? 1) : false,
                isLoading: false,
            });
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : "Không thể tải lịch sử hội thoại.",
            });
        }
    },

    loadMore: async () => {
        const { hasMore, isLoading, currentPage, fetchConversations } = get();
        if (!hasMore || isLoading) return;
        await fetchConversations(currentPage + 1);
    },

    setActiveId: (id) => set({ activeId: id }),

    addConversation: (conv) =>
        set((state) => ({
            conversations: [conv, ...state.conversations],
            activeId: conv.id,
        })),

    updateConversation: async (id, payload) => {
        // Optimistic update
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === id ? { ...c, title: payload.title } : c
            ),
        }));
        try {
            await conversationService.update(id, payload);
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Cập nhật thất bại." });
            // Rollback: refetch
            get().fetchConversations(1);
        }
    },

    deleteConversation: async (id) => {
        // Optimistic remove
        const prev = get().conversations;
        set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            activeId: state.activeId === id ? null : state.activeId,
        }));
        try {
            await conversationService.delete(id);
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Xóa thất bại.",
                conversations: prev, // rollback
            });
        }
    },

    clearError: () => set({ error: null }),
}));
