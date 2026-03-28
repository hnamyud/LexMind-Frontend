"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/lib/authService";
import blackHoleImg from "@/assets/sagittarius-a-black-3840x2160-25401.jpg";

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
            className="w-full flex items-center justify-center gap-3 border border-gray-700 bg-transparent hover:bg-gray-800/50 text-gray-300 py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
        >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const clearMessages = () => { setError(null); setSuccess(null); };

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

    const inputClass = "w-full bg-gray-800/30 border border-gray-700 text-gray-100 focus:ring-1 focus:ring-brand focus:border-brand px-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0d0d0d] border border-gray-800 shadow-2xl z-10 rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-gray-100 tracking-tight">{stepLabel[step]}</h2>
                        {step !== "done" && (
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-mono">
                                Bước {stepIndex[step] + 1} / 3
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                    </button>
                </div>

                {/* Progress */}
                {step !== "done" && (
                    <div className="h-0.5 bg-gray-800">
                        <div className="h-full bg-brand transition-all duration-500" style={{ width: `${((stepIndex[step] + 1) / 3) * 100}%` }} />
                    </div>
                )}

                <div className="px-6 py-6 space-y-5">
                    {error && (
                        <div className="flex items-start gap-2 px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm rounded">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-start gap-2 px-4 py-3 border border-green-500/40 bg-green-500/10 text-green-400 text-sm rounded">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">check_circle</span>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === "email" && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <p className="text-sm text-gray-400">Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP 6 chữ số để xác thực.</p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Email Address</label>
                                <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="counsel@firm.com" className={inputClass} />
                            </div>
                            <SubmitButton loading={loading} label="Gửi mã OTP" loadingLabel="Đang gửi OTP..." />
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === "otp" && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <p className="text-sm text-gray-400">
                                Mã OTP đã gửi đến <span className="text-brand font-semibold">{email}</span>. Nhập mã gồm 6 chữ số bên dưới.
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Mã OTP</label>
                                <input id="forgot-otp" type="text" required maxLength={6} pattern="\d{6}" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className={`${inputClass} tracking-[0.5em] text-center text-lg font-bold font-mono`} />
                            </div>
                            <SubmitButton loading={loading} label="Xác thực OTP" loadingLabel="Đang xác thực..." />
                            <button type="button" onClick={() => { clearMessages(); setStep("email"); }} className="w-full text-xs text-gray-500 hover:text-brand transition-colors font-mono uppercase tracking-widest">← Gửi lại OTP</button>
                        </form>
                    )}

                    {/* Step 3: New password */}
                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-sm text-gray-400">Nhập mật khẩu mới cho tài khoản <span className="text-brand font-semibold">{email}</span>.</p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Mật khẩu mới</label>
                                <div className="relative">
                                    <input id="forgot-new-password" type={showPassword ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Ít nhất 8 ký tự" className={inputClass} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand transition-colors">
                                        <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Xác nhận mật khẩu</label>
                                <input id="forgot-confirm-password" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" className={inputClass} />
                            </div>
                            <SubmitButton loading={loading} label="Đặt lại mật khẩu" loadingLabel="Đang cập nhật..." />
                        </form>
                    )}

                    {/* Done */}
                    {step === "done" && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-100">Đặt lại mật khẩu thành công!</p>
                                <p className="text-sm text-gray-500 mt-1">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
                            </div>
                            <button onClick={onClose} className="w-full bg-[#0a0a0a] text-white font-bold py-3 border border-brand/40 hover:border-brand hover:bg-black transition-all uppercase tracking-widest text-sm rounded">
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
            className="w-full bg-[#0a0a0a] text-white font-bold py-3.5 border border-brand/40 hover:border-brand hover:bg-black transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
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
            const user = useAuthStore.getState().user as Record<string, unknown> | null;
            if (user?.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/chat");
            }
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

    const inputClass = "w-full bg-gray-800/30 border border-gray-700 text-gray-100 focus:ring-1 focus:ring-brand focus:border-brand px-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-600";

    return (
        <>
            {showForgot && <ForgotPasswordModal onClose={closeForgot} />}

            <div className="relative min-h-screen flex overflow-hidden font-[family-name:var(--font-inter)] bg-[#020205]">

                {/* ── Left: Form Panel ── */}
                <div className="relative z-10 w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center px-6 sm:px-12 lg:px-14 overflow-y-auto bg-[#0a0a0a]/90 lg:bg-[#0a0a0a]/95 border-r border-gray-800/50">
                    <div className="max-w-md w-full mx-auto py-8 sm:py-12">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 mb-10">
                            <div className="w-8 h-8 flex items-center justify-center bg-brand text-black rounded">
                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">LexMind</span>
                        </div>

                        <header className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                                {activeTab === "login" ? "Welcome back" : "Create account"}
                            </h1>
                            <p className="text-gray-500 font-medium text-sm">
                                Professional Legal AI Infrastructure
                            </p>
                        </header>

                        {/* ── Google OAuth ── */}
                        <div className="mb-6 space-y-3">
                            <GoogleButton disabled={isLoading} />
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-800" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">or</span>
                                <div className="flex-1 h-px bg-gray-800" />
                            </div>
                        </div>

                        {/* ── Tabs ── */}
                        <div className="flex mb-6 border-b border-gray-800">
                            {(["login", "register"] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`pb-3 mr-6 text-xs font-bold uppercase tracking-widest font-mono transition-all border-b-2 -mb-px ${
                                        activeTab === tab
                                            ? "text-brand border-brand"
                                            : "text-gray-600 border-transparent hover:text-gray-400"
                                    }`}
                                >
                                    {tab === "login" ? "Sign In" : "Register"}
                                </button>
                            ))}
                        </div>

                        {/* ── Alerts ── */}
                        {error && (
                            <div className="mb-5 px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-start gap-2 rounded">
                                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-5 px-4 py-3 border border-green-500/40 bg-green-500/10 text-green-400 text-sm flex items-start gap-2 rounded">
                                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">check_circle</span>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* ── Login Form ── */}
                        {activeTab === "login" && (
                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Email Address</label>
                                    <input
                                        id="login-email"
                                        className={inputClass}
                                        placeholder="counsel@firm.com"
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => { clearError(); setShowForgot(true); }}
                                            className="text-[10px] uppercase font-bold text-brand hover:underline font-mono"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            className={inputClass}
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand transition-colors"
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
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Full Name</label>
                                    <input
                                        id="register-name"
                                        className={inputClass}
                                        placeholder="Nguyen Van A"
                                        type="text"
                                        required
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Email Address</label>
                                    <input
                                        id="register-email"
                                        className={inputClass}
                                        placeholder="user@example.com"
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Password</label>
                                    <div className="relative">
                                        <input
                                            id="register-password"
                                            className={inputClass}
                                            placeholder="Ít nhất 8 ký tự"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand transition-colors"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono">Mật khẩu phải có ít nhất 8 ký tự</p>
                                </div>
                                <div className="pt-2">
                                    <SubmitButton loading={isLoading} label="Create Account" loadingLabel="Creating Account..." />
                                </div>
                            </form>
                        )}

                        <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center opacity-50">
                            <span className="text-[10px] uppercase font-mono text-gray-500">© 2026 LexMind</span>
                            <div className="flex gap-4">
                                <a className="text-[10px] uppercase font-mono text-gray-500 hover:text-brand transition-colors" href="#">Privacy</a>
                                <a className="text-[10px] uppercase font-mono text-gray-500 hover:text-brand transition-colors" href="#">Terms</a>
                            </div>
                        </footer>
                    </div>
                </div>

                {/* ── Right: Black hole image + branding ── */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
                    {/* Static black hole image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image
                                src={blackHoleImg}
                                alt="Black hole Sagitarrius A*"
                                fill
                                className="object-cover"
                                priority
                                quality={90}
                            />
                        </div>
                    </div>

                    {/* Branding overlay */}
                    <div className="relative z-10 text-center flex flex-col items-center pointer-events-none">
                        <h2 className="text-6xl xl:text-7xl font-bold text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(0,255,255,0.15)]">
                            LexMind
                        </h2>
                        <div className="h-px w-24 bg-brand/40 mx-auto mb-5" />
                        <p className="text-brand/60 uppercase tracking-[0.4em] text-[11px] font-bold font-mono">
                            Intelligence in Jurisprudence
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
