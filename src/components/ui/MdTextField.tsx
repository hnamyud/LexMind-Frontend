"use client";

import React from "react";

type MdTextFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

export function MdTextField({ className = "", ...props }: MdTextFieldProps) {
  return (
    <input
      className={[
        "h-11 w-full rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-4 text-sm text-[var(--md-sys-color-on-surface)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface-container-low)] focus:ring-2 focus:ring-[var(--md-sys-state-focus)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
