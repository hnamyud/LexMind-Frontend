"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, User, LoginPayload, RegisterPayload } from "@/lib/authService";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;
    _hasHydrated: boolean;

    // Actions
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<{ message: string }>;
    logout: () => Promise<void>;
    refresh: () => Promise<boolean>;
    fetchProfile: () => Promise<boolean>;
    clearError: () => void;
    setUser: (user: User | null) => void;
    setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
            _hasHydrated: false,

            login: async (payload) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.login(payload);
                    set({
                        accessToken: data.accessToken ?? null,
                        user: data.user ?? null,
                        isLoading: false,
                        error: null,
                    });
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : "Đăng nhập thất bại";
                    set({ isLoading: false, error: message });
                    throw err;
                }
            },

            register: async (payload) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.register(payload);
                    set({ isLoading: false, error: null });
                    return { message: data.message };
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : "Đăng ký thất bại";
                    set({ isLoading: false, error: message });
                    throw err;
                }
            },

            logout: async () => {
                set({ isLoading: true, error: null });
                try {
                    await authService.logout();
                } finally {
                    set({ user: null, accessToken: null, isLoading: false, error: null });
                }
            },

            /**
             * Dùng cookie refresh_token để lấy accessToken mới.
             * Trả về true nếu thành công, false nếu không còn phiên hợp lệ.
             */
            refresh: async () => {
                try {
                    const data = await authService.refresh();
                    set({ accessToken: data.accessToken });
                    // Sau khi có token mới, lấy profile
                    const profile = await authService.getProfile();
                    // Loại bỏ validation khắt khe, gán trực tiếp profile làm user
                    const user = profile.user ?? (profile.data as User) ?? (profile as unknown as User);
                    set({ user });
                    return true;
                } catch {
                    // Cookie hết hạn hoặc không còn phiên → clear state
                    set({ user: null, accessToken: null });
                    return false;
                }
            },

            fetchProfile: async () => {
                if (!get().accessToken && !authService.isAuthenticated()) return false;
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.getProfile();
                    console.log("Profile Data Raw:", data);
                    
                    const user = data.user ?? (data.data as User) ?? (data as unknown as User);
                    console.log("Parsed User:", user);
                    
                    set({ user, isLoading: false, accessToken: authService.getToken() }); // Đảm bảo đồng bộ với token
                    return true;
                } catch (err) {
                    console.error("fetchProfile failed:", err);
                    set({ isLoading: false, user: null, accessToken: null });
                    return false;
                }
            },

            clearError: () => set({ error: null }),
            setUser: (user) => set({ user }),
            setHasHydrated: (val) => set({ _hasHydrated: val }),
        }),
        {
            name: "lexmind-auth",
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

/** Hook trả về true sau khi Zustand persist đã rehydrate xong từ localStorage */
export function useAuthHasHydrated() {
    return useAuthStore((s) => s._hasHydrated);
}
