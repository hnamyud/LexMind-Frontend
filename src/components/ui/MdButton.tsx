"use client";

import React from "react";

type Variant = "filled" | "tonal" | "outlined" | "text";
type Tone = "primary" | "secondary" | "neutral" | "danger" | "legal";
type Size = "sm" | "md" | "lg";

interface MdButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  tone?: Tone;
  size?: Size;
}

const sizeMap: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

const variantMap: Record<Variant, Record<Tone, string>> = {
  filled: {
    primary: "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:brightness-105",
    secondary: "bg-[var(--md-sys-color-secondary)] text-[var(--md-sys-color-on-secondary)] hover:brightness-105",
    neutral: "bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] hover:brightness-105",
    danger: "bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:brightness-105",
    legal: "bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)] hover:brightness-105",
  },
  tonal: {
    primary: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:bg-[var(--md-sys-state-focus)]",
    secondary: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-state-hover)]",
    neutral: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)] hover:bg-[var(--danger-border)]",
    legal: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] hover:bg-[var(--legal-border)]",
  },
  outlined: {
    primary: "border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-state-focus)]",
    secondary: "border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-secondary)] hover:bg-[var(--md-sys-state-hover)]",
    neutral: "border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-state-hover)]",
    danger: "border border-[var(--danger-border)] text-[var(--danger)] hover:bg-[var(--danger-soft)]",
    legal: "border border-[var(--legal-border)] text-[var(--legal)] hover:bg-[var(--legal-soft)]",
  },
  text: {
    primary: "text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-state-focus)]",
    secondary: "text-[var(--md-sys-color-secondary)] hover:bg-[var(--md-sys-state-hover)]",
    neutral: "text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-state-hover)]",
    danger: "text-[var(--danger)] hover:bg-[var(--danger-soft)]",
    legal: "text-[var(--legal)] hover:bg-[var(--legal-soft)]",
  },
};

export function MdButton({
  children,
  className = "",
  variant = "filled",
  tone = "primary",
  size = "md",
  type = "button",
  ...props
}: MdButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)] disabled:cursor-not-allowed disabled:opacity-50",
        sizeMap[size],
        variantMap[variant][tone],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
