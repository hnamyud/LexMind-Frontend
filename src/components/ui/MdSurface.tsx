"use client";

import React from "react";

interface MdSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  glass?: boolean;
}

export function MdSurface({
  children,
  className = "",
  elevated = true,
  glass = false,
  ...props
}: MdSurfaceProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-md)] border border-[var(--md-sys-color-outline-variant)]",
        glass ? "md3-glass" : "bg-[var(--md-sys-color-surface-container)]",
        elevated ? "shadow-[var(--shadow-panel)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
