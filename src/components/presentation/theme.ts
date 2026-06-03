export const colors = {
  bg: "#f7f9fc",
  bg2: "#eaf5f8",
  surface: "#ffffff",
  surfaceVariant: "#e5eef2",
  surfaceHigh: "#eef4f7",
  primary: "#0f6c7a",
  primaryBright: "#24b7c9",
  primaryContainer: "#c9f2ff",
  onPrimaryContainer: "#00363f",
  secondary: "#4b6269",
  tertiary: "#b8761f",
  tertiaryContainer: "#ffdea3",
  success: "#386a20",
  successContainer: "#d7f7c7",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  text: "#172126",
  muted: "#52656d",
  faint: "#7a8b93",
  outline: "#c3d0d6",
};

export const font = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const sceneStyle = {
  background:
    `radial-gradient(circle at 18% 18%, ${colors.primaryContainer} 0, transparent 28%), ` +
    `radial-gradient(circle at 82% 24%, ${colors.tertiaryContainer} 0, transparent 24%), ` +
    `linear-gradient(135deg, ${colors.bg}, ${colors.bg2})`,
  color: colors.text,
  fontFamily: font,
} as const;

export const surfaceStyle = {
  background: "rgba(255,255,255,0.78)",
  border: `1px solid ${colors.outline}`,
  boxShadow: "0 28px 70px rgba(18, 39, 48, 0.12)",
  backdropFilter: "blur(18px)",
} as const;

export function fade(frame: number, from: number, to: number) {
  return Math.max(0, Math.min(1, (frame - from) / (to - from)));
}

export function slideUp(frame: number, from: number, distance = 28) {
  const p = fade(frame, from, from + 24);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
  };
}
