"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";
import { useAuthStore } from "@/store/authStore";
import { MdButton } from "@/components/ui/MdButton";
import { MdIconButton } from "@/components/ui/MdIconButton";
import { MdSurface } from "@/components/ui/MdSurface";
import { MdTextField } from "@/components/ui/MdTextField";

type Tab = "login" | "register";
type ForgotStep = "email" | "otp" | "reset" | "done";

function GoogleButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      id="google-login-btn"
      type="button"
      disabled={disabled}
      onClick={() => authService.redirectToGoogle()}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-container)] disabled:opacity-50"
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

function Notice({ tone, children }: { tone: "error" | "success" | "warning"; children: React.ReactNode }) {
  const toneClasses = {
    error: "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
    success: "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
    warning: "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await authService.sendOtp({ email });
      setSuccess(res.message ?? "OTP đã được gửi.");
      setTimeout(() => {
        setSuccess(null);
        setStep("otp");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otp.length !== 6) {
      setError("OTP phải có 6 chữ số.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ email, otp });
      setSuccess(res.message ?? "OTP hop le.");
      setTimeout(() => {
        setSuccess(null);
        setStep("reset");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, otp, newPassword });
      setSuccess(res.message ?? "Đặt lại mật khẩu thành công.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel: Record<ForgotStep, string> = {
    email: "Quên mật khẩu",
    otp: "Nhập OTP",
    reset: "Mật khẩu mới",
    done: "Hoàn tất",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm md:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <MdSurface className="relative z-10 max-h-[calc(100dvh-1.5rem-var(--safe-area-top)-var(--safe-area-bottom))] w-full max-w-md overflow-y-auto p-5 md:max-h-[calc(100dvh-2rem)] md:p-6" glass>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Password recovery</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{stepLabel[step]}</h2>
          </div>
          <MdIconButton onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </MdIconButton>
        </div>

        <div className="mt-6 space-y-4">
          {error && <Notice tone="error">{error}</Notice>}
          {success && <Notice tone="success">{success}</Notice>}

          {step === "email" && (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">Nhập email đã đăng ký để nhận mã OTP 6 chữ số.</p>
              <MdTextField type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="counsel@firm.com" />
              <MdButton className="w-full" type="submit" disabled={loading}>
                {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
              </MdButton>
            </form>
          )}

          {step === "otp" && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">Nhập mã đã gửi tới {email}.</p>
              <MdTextField
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-[0.35em]"
              />
              <MdButton className="w-full" type="submit" disabled={loading}>
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </MdButton>
            </form>
          )}

          {step === "reset" && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <MdTextField
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới"
              />
              <MdTextField
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((prev) => !prev)} />
                Hiện mật khẩu
              </label>
              <MdButton className="w-full" type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </MdButton>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">Bạn có thể đăng nhập lại bằng mật khẩu mới.</p>
              <MdButton className="w-full" onClick={onClose}>
                Đóng
              </MdButton>
            </div>
          )}
        </div>
      </MdSurface>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [systemMessage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const reason = new URLSearchParams(window.location.search).get("reason");
    return reason === "session-expired" ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." : null;
  });
  const [showForgot, setShowForgot] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (reason === "session-expired") {
      params.delete("reason");
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    clearError();
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      const user = useAuthStore.getState().user as Record<string, unknown> | null;
      router.push(user?.role === "ADMIN" ? "/admin" : "/chat");
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    try {
      const result = await register({ name: regName, email: regEmail, password: regPassword });
      setSuccessMessage(result.message ?? "Đăng ký thành công.");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setTimeout(() => {
        setActiveTab("login");
        setSuccessMessage(null);
      }, 1500);
    } catch {}
  };

  const closeForgot = useCallback(() => setShowForgot(false), []);

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={closeForgot} />}

      <div className="min-h-screen overflow-x-hidden md3-hero">
        <div className="mx-auto grid min-h-screen max-w-[1380px] gap-6 px-4 py-4 md:px-8 md:py-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
          <section className="order-2 space-y-5 pb-4 lg:order-1 lg:space-y-6 lg:pb-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
              <span className="material-symbols-outlined text-[16px]">shield_lock</span>
              Secure legal workspace
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-[2.65rem] font-semibold leading-[0.98] tracking-tight text-[var(--text-primary)] sm:text-5xl">
                Bước vào không gian làm việc pháp lý tinh gọn, minh bạch và hiệu quả.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
                Trải nghiệm giải pháp tra cứu luật dựa trên AI kết hợp Bản đồ tri thức. Hệ thống giúp bạn tối ưu hóa quy trình phân tích, trích dẫn nguồn luật chính xác và quản lý dữ liệu pháp lý chỉ trong một nền tảng.
              </p>
            </div>

            <div className="hidden gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid">
              {[
                ["Tương tác trực quan", "Giao diện hội thoại tối giản, tập trung hoàn toàn vào câu hỏi và câu trả lời của bạn."],
                ["Minh bạch nguồn luật", "Mọi câu trả lời đều đi kèm trích dẫn điều khoản, nghị định chính xác theo thời gian thực."],
                ["Quản trị thông minh", "Bảng điều khiển tối ưu cho việc quét dữ liệu, lọc và kiểm duyệt thông tin nhanh chóng."],
              ].map(([title, copy]) => (
                <MdSurface key={title} className="p-4" elevated={false} glass>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{copy}</p>
                </MdSurface>
              ))}
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <MdSurface className="mx-auto max-w-lg p-5 md:p-8" glass>
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">LexMind</p>
                  <p className="text-sm text-[var(--text-muted)]">Material 3 legal workspace</p>
                </div>
              </div>

              <div className="mb-6 flex rounded-full bg-[var(--surface-container)] p-1">
                {(["login", "register"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-sm transition-colors ${
                      activeTab === tab
                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {tab === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                    {activeTab === "login" ? "Chào mừng quay lại" : "Tạo tài khoản mới"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {activeTab === "login"
                      ? "Đăng nhập để tiếp tục tra cứu, hỏi đáp và review văn bản luật."
                      : "Đăng ký để truy cập không gian hỏi đáp pháp lý và admin workflow."}
                  </p>
                </div>

                <GoogleButton disabled={isLoading} />

                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  <div className="h-px flex-1 bg-[var(--border-primary)]" />
                  HOẶC
                  <div className="h-px flex-1 bg-[var(--border-primary)]" />
                </div>

                {error && <Notice tone="error">{error}</Notice>}
                {systemMessage && <Notice tone="warning">{systemMessage}</Notice>}
                {successMessage && <Notice tone="success">{successMessage}</Notice>}

                {activeTab === "login" && (
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-sm text-[var(--text-secondary)]">
                        Email
                      </label>
                      <MdTextField
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="counsel@firm.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-sm text-[var(--text-secondary)]">Password</label>
                        <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-[var(--accent)]">
                          Quên mật khẩu?
                        </button>
                      </div>
                      <MdTextField
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((prev) => !prev)} />
                      Hiện mật khẩu
                    </label>
                    <MdButton className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </MdButton>
                  </form>
                )}

                {activeTab === "register" && (
                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <label htmlFor="register-name" className="text-sm text-[var(--text-secondary)]">
                        Họ và tên
                      </label>
                      <MdTextField
                        id="register-name"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="register-email" className="text-sm text-[var(--text-secondary)]">
                        Email
                      </label>
                      <MdTextField
                        id="register-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="register-password" className="text-sm text-[var(--text-secondary)]">
                        Password
                      </label>
                      <MdTextField
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                      />
                    </div>
                    <MdButton className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                    </MdButton>
                  </form>
                )}
              </div>
            </MdSurface>
          </section>
        </div>
      </div>
    </>
  );
}
