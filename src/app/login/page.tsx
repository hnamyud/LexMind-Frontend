"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="bg-background-light dark:bg-[#121212] min-h-screen flex items-center justify-center overflow-hidden font-[family-name:var(--font-public-sans)]">
            <div className="flex w-full h-screen">
                {/* Left Side: Login Form */}
                <div className="w-full lg:w-1/2 bg-white dark:bg-legal-charcoal flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 border-r border-slate-200 dark:border-slate-800">
                    <div className="max-w-md w-full mx-auto">
                        <header className="mb-12">
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <span className="material-symbols-outlined text-login-primary text-3xl">
                                    gavel
                                </span>
                                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase mono-text">
                                    LexMind
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                                Welcome to LexMind
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Professional Legal AI Infrastructure
                            </p>
                        </header>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                    Email Address
                                </label>
                                <input
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                    placeholder="counsel@firm.com"
                                    type="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mono-text">
                                        Password
                                    </label>
                                    <a
                                        className="text-[10px] uppercase font-bold text-login-primary hover:underline mono-text"
                                        href="#"
                                    >
                                        Forgot?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-login-primary focus:border-login-primary px-4 py-3 rounded-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
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

                            <div className="pt-4">
                                <button
                                    className="w-full bg-legal-navy dark:bg-slate-900 text-white font-bold py-4 border border-login-primary/40 hover:border-login-primary hover:bg-black transition-all duration-300 mono-text uppercase tracking-widest text-sm"
                                    type="submit"
                                >
                                    Sign In
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Don&apos;t have an account?
                                <a
                                    className="text-login-primary font-bold hover:underline mono-text ml-1"
                                    href="#"
                                >
                                    Sign Up
                                </a>
                            </p>
                        </div>

                        <footer className="mt-24 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-50">
                            <span className="text-[10px] uppercase mono-text text-slate-400">
                                © 2024 LexMind Systems
                            </span>
                            <div className="flex gap-4">
                                <a
                                    className="text-[10px] uppercase mono-text text-slate-400 hover:text-login-primary transition-colors"
                                    href="#"
                                >
                                    Privacy
                                </a>
                                <a
                                    className="text-[10px] uppercase mono-text text-slate-400 hover:text-login-primary transition-colors"
                                    href="#"
                                >
                                    Terms
                                </a>
                            </div>
                        </footer>
                    </div>
                </div>

                {/* Right Side: Branding/Logo */}
                <div className="hidden lg:flex w-1/2 bg-legal-navy relative items-center justify-center overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div
                            className="absolute top-0 left-0 w-full h-full"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 50% 50%, #ec5b13 0%, transparent 70%)",
                            }}
                        ></div>
                    </div>

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="mb-8 relative">
                            {/* Subtle Glow */}
                            <div className="absolute inset-0 bg-login-primary/20 blur-[80px] rounded-full"></div>
                            {/* Logo Composition */}
                            <div className="relative bg-legal-navy p-12 border border-login-primary/20 rounded-full flex items-center justify-center glow-effect">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-login-primary text-7xl select-none">
                                        gavel
                                    </span>
                                    <span className="material-symbols-outlined text-login-primary text-5xl select-none absolute -top-2 -right-2 opacity-50">
                                        neurology
                                    </span>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-6xl font-bold text-white tracking-tighter mb-4 mono-text">
                            LexMind
                        </h2>
                        <div className="h-px w-24 bg-login-primary/50 mx-auto mb-6"></div>
                        <p className="text-login-primary/70 uppercase tracking-[0.5em] text-xs font-bold mono-text">
                            Intelligence in Jurisprudence
                        </p>
                    </div>

                    {/* Abstract Data Visualization Pattern */}
                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end h-32 opacity-20 pointer-events-none">
                        <div className="w-px bg-login-primary h-full"></div>
                        <div className="w-px bg-login-primary h-2/3"></div>
                        <div className="w-px bg-login-primary h-1/2"></div>
                        <div className="w-px bg-login-primary h-3/4"></div>
                        <div className="w-px bg-login-primary h-full"></div>
                        <div className="w-px bg-login-primary h-4/5"></div>
                        <div className="w-px bg-login-primary h-1/3"></div>
                        <div className="w-px bg-login-primary h-2/3"></div>
                        <div className="w-px bg-login-primary h-full"></div>
                        <div className="w-px bg-login-primary h-1/4"></div>
                        <div className="w-px bg-login-primary h-3/4"></div>
                        <div className="w-px bg-login-primary h-1/2"></div>
                        <div className="w-px bg-login-primary h-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
