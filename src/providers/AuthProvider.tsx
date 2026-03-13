"use client";

/**
 * AuthProvider
 * ─────────────────────────────────────────────────────
 * Mount vào root layout. Khi user F5 hoặc mở tab mới:
 *   1. Nếu có accessToken trong localStorage → lấy profile  
 *   2. Nếu không có accessToken → thử refresh bằng cookie
 *   3. Nếu cả hai đều thất bại → user chưa đăng nhập (không làm gì thêm)
 *
 * Việc này đảm bảo:
 *   - Session được duy trì sau khi F5 miễn còn refresh_token cookie hợp lệ
 *   - Profile luôn được sync với server khi reload
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/lib/authService";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { accessToken, refresh, fetchProfile } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Chỉ chạy một lần
        if (initialized.current) return;
        initialized.current = true;

        const init = async () => {
            let success = false;

            if (accessToken || authService.isAuthenticated()) {
                // 1. Thử gọi API profile (bên trong fetchProfile, apiClient sẽ tự retry nếu 401)
                success = await fetchProfile();
                
                // 2. Nếu fetchProfile tự retry refresh cũng fail thì accessToken hết tác dụng, fall back thử refresh manually nếu cần,
                // Nhưng apiClient đã interceptor refresh+retry rồi. Nếu vẫn fail thì means refresh cookie cũng invalid.
                // Thử lại lần cuối để cover trường hợp refresh token vẫn còn
                if (!success) {
                  success = await refresh();
                }
            } else {
                // Không có token nhưng user F5 → Thử refresh qua cookie
                success = await refresh();
            }

            // Nếu thất bại hoàn toàn (token refresh lỗi/hết hạn), và không phải ở trang login/register thì redirect
            if (!success) {
                if (pathname && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
                    router.push("/login"); // Về màn login
                }
            }
        };

        init();
    }, [accessToken, fetchProfile, pathname, refresh, router]);

    return <>{children}</>;
}
