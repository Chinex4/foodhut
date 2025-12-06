import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "foodhut_theme_preference";

export async function getStoredTheme(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark") return value;
    return null;
  } catch {
    return null;
  }
}

export async function setStoredTheme(mode: ThemeMode) {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore storage errors; UI will still update
  }
}
