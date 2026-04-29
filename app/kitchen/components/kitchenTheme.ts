export type KitchenPalette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
  overlay: string;
};

const lightPalette: KitchenPalette = {
  background: "#F7F2E8",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F4F7",
  elevated: "#FFF8EB",
  border: "#EDE5D8",
  textPrimary: "#1B1F28",
  textSecondary: "#6F7C93",
  textMuted: "#95A1B5",
  accent: "#F7A600",
  accentSoft: "#FFE6B3",
  accentStrong: "#D97706",
  danger: "#E5484D",
  dangerSoft: "#FFECEE",
  success: "#16A34A",
  warning: "#B45309",
  overlay: "rgba(0, 0, 0, 0.35)",
};

const darkPalette: KitchenPalette = {
  background: "#0A0A0A",
  surface: "#171717",
  surfaceAlt: "#1F1F1F",
  elevated: "#262626",
  border: "#2F2F2F",
  textPrimary: "#FAFAFA",
  textSecondary: "#C4C4C4",
  textMuted: "#8A8A8A",
  accent: "#F7A600",
  accentSoft: "#312208",
  accentStrong: "#FDBA29",
  danger: "#F87171",
  dangerSoft: "#311318",
  success: "#4ADE80",
  warning: "#FBBF24",
  overlay: "rgba(0, 0, 0, 0.78)",
};

export function getKitchenPalette(isDark: boolean): KitchenPalette {
  return isDark ? darkPalette : lightPalette;
}
