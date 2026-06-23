import { BlurView } from "expo-blur";
import {
  GlassView,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Platform, StyleSheet } from "react-native";

type GlassTabBarBackgroundProps = {
  isDark: boolean;
};

export function GlassTabBarBackground({
  isDark,
}: GlassTabBarBackgroundProps) {
  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        colorScheme={isDark ? "dark" : "light"}
        glassEffectStyle="regular"
        style={StyleSheet.absoluteFill}
        tintColor={isDark ? "#111111" : "#FFF8EC"}
      />
    );
  }

  return (
    <BlurView
      experimentalBlurMethod={
        Platform.OS === "android" ? "dimezisBlurView" : undefined
      }
      intensity={Platform.OS === "android" ? 80 : 70}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark
            ? "rgba(10, 10, 10, 0.55)"
            : "rgba(255, 248, 236, 0.45)",
        },
      ]}
      tint={isDark ? "dark" : "light"}
    />
  );
}
