"use client";

import React from "react";

type MdIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function MdIconButton({ className = "", children, type = "button", ...props }: MdIconButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-state-hover)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
