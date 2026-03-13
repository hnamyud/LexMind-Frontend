"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/lib/authService";

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = "login" | "register";
type ForgotStep = "email" | "otp" | "reset" | "done";

// ─── Google Button ───────────────────────────────────────────────────────────
function GoogleButton({ disabled }: { disabled?: boolean }) {
    return (
        <button
            id="google-login-btn"
            type="button"
            disabled={disabled}
            onClick={() => authService.redirectToGoogle()}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {/* Google SVG icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
            <span className="text-sm font-semibold tracking-wide">Continue with Google</span>
        </button>
    );
}

// ─── Forgot Password Modal ────────────────────────────────────────────────────
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

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const clearMessages = () => { setError(null); setSuccess(null); };

    // Step 1: Gửi OTP đến email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const res = await authService.sendOtp({ email });
            setSuccess(res.message ?? "Mã OTP đã được gửi đến email của bạn!");
            setTimeout(() => { setSuccess(null); setStep("otp"); }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể gửi OTP. Thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Xác thực OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        if (otp.length !== 6) { setError("OTP phải có đúng 6 chữ số."); return; }
        setLoading(true);
        try {
            const res = await authService.verifyOtp({ email, otp });
            setSuccess(res.message ?? "Xác thực OTP thành công!");
            setTimeout(() => { setSuccess(null); setStep("reset"); }, 1200);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Mã OTP không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Đặt lại mật khẩu
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        if (newPassword.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
        if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
        setLoading(true);
        try {
            const res = await authService.resetPassword({ email, otp, newPassword });
            setSuccess(res.message ?? "Đặt lại mật khẩu thành công!");
            setStep("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu. Thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const stepLabel: Record<ForgotStep, string> = {
        email: "Quên mật khẩu",
        otp: "Nhập mã OTP",
        reset: "Đặt mật khẩu mới",
        done: "Hoàn tất",
    };

    const stepIndex: Record<ForgotStep, number> = { email: 0, otp: 1, reset: 2, done: 3 };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-legal-charcoal border border-slate-200 dark:border-slate-700 shadow-2xl z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mono-text">
                            {stepLabel[step]}
                        </h2>
                        {step !== "done" && (
                            <p className="text-[10px] text-slate-400 mono-text uppercase tracking-widest mt-0.5">
                                Bước {stepIndex[step] + 1} / 3
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                {step !== "done" && (
                    <div className="h-0.5 bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full bg-login-primary transition-all duration-500"
                            style={{ width: `${((stepIndex[step] + 1) / 3) * 100}%` }}
                        />
                    </div>
                )}

                <div className="px-6 py-6 space-y-5">
                    {/* Error / Success */}
                    {error && (
                        <div className="flex items-start gap-2 px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-start gap-2 px-4 py-3 border border-green-500/40 bg-green-500/10 text-green-400 text-sm">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">check_circle</span>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* ── Step 1: Email ── */}
                    {step === "email" && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP 6 chữ số để xác thực.
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                    Email Address
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="counsel@firm.com"
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <SubmitButton loading={loading} label="Gửi mã OTP" loadingLabel="Đang gửi OTP..." />
                        </form>
                    )}

                    {/* ── Step 2: OTP ── */}
                    {step === "otp" && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Mã OTP đã gửi đến <span className="text-login-primary font-semibold">{email}</span>. Nhập mã gồm 6 chữ số bên dưới.
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                    Mã OTP
                                </label>
                                <input
                                    id="forgot-otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    pattern="\d{6}"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-[0.5em] text-center text-lg font-bold mono-text"
                                />
                            </div>
                            <SubmitButton loading={loading} label="Xác thực OTP" loadingLabel="Đang xác thực..." />
                            <button
                                type="button"
                                onClick={() => { clearMessages(); setStep("email"); }}
                                className="w-full text-xs text-slate-400 hover:text-login-primary transition-colors mono-text uppercase tracking-widest"
                            >
                                ← Gửi lại OTP
                            </button>
                        </form>
                    )}

                    {/* ── Step 3: New password ── */}
                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Nhập mật khẩu mới cho tài khoản <span className="text-login-primary font-semibold">{email}</span>.
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        id="forgot-new-password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ít nhất 8 ký tự"
                                        className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-login-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="forgot-confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <SubmitButton loading={loading} label="Đặt lại mật khẩu" loadingLabel="Đang cập nhật..." />
                        </form>
                    )}

                    {/* ── Done ── */}
                    {step === "done" && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mono-text">
                                    Đặt lại mật khẩu thành công!
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Bạn có thể đăng nhập bằng mật khẩu mới.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-legal-navy dark:bg-slate-900 text-white font-bold py-3 border border-login-primary/40 hover:border-login-primary hover:bg-black transition-all mono-text uppercase tracking-widest text-sm"
                            >
                                Đóng & Đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Reusable Submit Button ──────────────────────────────────────────────────
function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-legal-navy dark:bg-slate-900 text-white font-bold py-3.5 border border-login-primary/40 hover:border-login-primary hover:bg-black transition-all duration-300 mono-text uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    {loadingLabel}
                </>
            ) : label}
        </button>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
    const router = useRouter();
    const { login, register, isLoading, error, clearError } = useAuthStore();

    const [activeTab, setActiveTab] = useState<Tab>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showForgot, setShowForgot] = useState(false);

    // ── Login form ──
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // ── Register form ──
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

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
            router.push("/chat");
        } catch { /* error stored in zustand */ }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage(null);
        try {
            const result = await register({ name: regName, email: regEmail, password: regPassword });
            setSuccessMessage(result.message ?? "Đăng ký thành công! Hãy đăng nhập.");
            setRegName(""); setRegEmail(""); setRegPassword("");
            setTimeout(() => { setActiveTab("login"); setSuccessMessage(null); }, 2000);
        } catch { /* error stored in zustand */ }
    };

    const closeForgot = useCallback(() => setShowForgot(false), []);

    return (
        <>
            {/* ── Forgot Password Modal ── */}
            {showForgot && <ForgotPasswordModal onClose={closeForgot} />}

            <div className="bg-background-light dark:bg-[#121212] min-h-screen flex items-center justify-center overflow-hidden font-[family-name:var(--font-public-sans)]">
                <div className="flex w-full h-screen">

                    {/* ── Left: Form ── */}
                    <div className="w-full lg:w-1/2 bg-white dark:bg-legal-charcoal flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                        <div className="max-w-md w-full mx-auto py-12">
                            {/* Mobile logo */}
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <span className="material-symbols-outlined text-login-primary text-3xl">gavel</span>
                                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase mono-text">LexMind</span>
                            </div>

                            <header className="mb-8">
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                                    Welcome to LexMind
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Professional Legal AI Infrastructure
                                </p>
                            </header>

                            {/* ── Google OAuth button ── */}
                            <div className="mb-6 space-y-3">
                                <GoogleButton disabled={isLoading} />
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 mono-text">or</span>
                                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                </div>
                            </div>

                            {/* ── Tabs ── */}
                            <div className="flex mb-6 border-b border-slate-200 dark:border-slate-700">
                                {(["login", "register"] as Tab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabChange(tab)}
                                        className={`pb-3 mr-6 text-xs font-bold uppercase tracking-widest mono-text transition-all border-b-2 -mb-px ${
                                            activeTab === tab
                                                ? "text-login-primary border-login-primary"
                                                : "text-slate-400 border-transparent hover:text-slate-600"
                                        }`}
                                    >
                                        {tab === "login" ? "Sign In" : "Register"}
                                    </button>
                                ))}
                            </div>

                            {/* ── Alert ── */}
                            {error && (
                                <div className="mb-5 px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-start gap-2">
                                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                                    <span>{error}</span>
                                </div>
                            )}
                            {successMessage && (
                                <div className="mb-5 px-4 py-3 border border-green-500/40 bg-green-500/10 text-green-400 text-sm flex items-start gap-2">
                                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">check_circle</span>
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* ── Login Form ── */}
                            {activeTab === "login" && (
                                <form className="space-y-5" onSubmit={handleLogin}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                            Email Address
                                        </label>
                                        <input
                                            id="login-email"
                                            className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                            placeholder="counsel@firm.com"
                                            type="email"
                                            required
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                                Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => { clearError(); setShowForgot(true); }}
                                                className="text-[10px] uppercase font-bold text-login-primary hover:underline mono-text"
                                            >
                                                Forgot?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="login-password"
                                                className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                                placeholder="••••••••"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-login-primary transition-colors"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {showPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <SubmitButton loading={isLoading} label="Sign In" loadingLabel="Signing In..." />
                                    </div>
                                </form>
                            )}

                            {/* ── Register Form ── */}
                            {activeTab === "register" && (
                                <form className="space-y-4" onSubmit={handleRegister}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                            Full Name
                                        </label>
                                        <input
                                            id="register-name"
                                            className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                            placeholder="Nguyen Van A"
                                            type="text"
                                            required
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                            Email Address
                                        </label>
                                        <input
                                            id="register-email"
                                            className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                            placeholder="user@example.com"
                                            type="email"
                                            required
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="register-password"
                                                className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                                placeholder="Ít nhất 8 ký tự"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-login-primary transition-colors"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {showPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mono-text">Mật khẩu phải có ít nhất 8 ký tự</p>
                                    </div>
                                    <div className="pt-2">
                                        <SubmitButton loading={isLoading} label="Create Account" loadingLabel="Creating Account..." />
                                    </div>
                                </form>
                            )}

                            <footer className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-50">
                                <span className="text-[10px] uppercase mono-text text-slate-400">© 2024 LexMind Systems</span>
                                <div className="flex gap-4">
                                    <a className="text-[10px] uppercase mono-text text-slate-400 hover:text-login-primary transition-colors" href="#">Privacy</a>
                                    <a className="text-[10px] uppercase mono-text text-slate-400 hover:text-login-primary transition-colors" href="#">Terms</a>
                                </div>
                            </footer>
                        </div>
                    </div>

                    {/* ── Right: Branding ── */}
                    <div className="hidden lg:flex w-1/2 bg-legal-navy relative items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full"
                                style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #ec5b13 0%, transparent 70%)" }} />
                        </div>
                        <div className="relative z-10 text-center flex flex-col items-center">
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-login-primary/20 blur-[80px] rounded-full" />
                                <div className="relative bg-legal-navy p-12 border border-login-primary/20 rounded-full flex items-center justify-center glow-effect">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-login-primary text-7xl select-none">gavel</span>
                                        <span className="material-symbols-outlined text-login-primary text-5xl select-none absolute -top-2 -right-2 opacity-50">neurology</span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-6xl font-bold text-white tracking-tighter mb-4 mono-text">LexMind</h2>
                            <div className="h-px w-24 bg-login-primary/50 mx-auto mb-6" />
                            <p className="text-login-primary/70 uppercase tracking-[0.5em] text-xs font-bold mono-text">
                                Intelligence in Jurisprudence
                            </p>
                        </div>
                        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end h-32 opacity-20 pointer-events-none">
                            {[100, 66, 50, 75, 100, 80, 33, 66, 100, 25, 75, 50, 100].map((h, i) => (
                                <div key={i} className="w-px bg-login-primary" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
