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
  background: "#04070D",
  surface: "#0A111C",
  surfaceAlt: "#0E1624",
  elevated: "#121C2C",
  border: "#1A2638",
  textPrimary: "#F8FBFF",
  textSecondary: "#9AA9C2",
  textMuted: "#74839B",
  accent: "#F7A600",
  accentSoft: "#2A1D08",
  accentStrong: "#FDBA29",
  danger: "#F87171",
  dangerSoft: "#2B1219",
  success: "#4ADE80",
  warning: "#FBBF24",
  overlay: "rgba(2, 6, 23, 0.78)",
};

export function getKitchenPalette(isDark: boolean): KitchenPalette {
  return isDark ? darkPalette : lightPalette;
}
