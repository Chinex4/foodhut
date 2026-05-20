import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

export type DashboardMode = "users" | "riders" | "kitchen";

const isDashboardMode = (value: string | null): value is DashboardMode =>
  value === "users" || value === "riders" || value === "kitchen";

export async function saveLastDashboard(mode: DashboardMode) {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_DASHBOARD, mode);
}

export async function getLastDashboard(): Promise<DashboardMode | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DASHBOARD);
  return isDashboardMode(value) ? value : null;
}

export async function clearLastDashboard() {
  await AsyncStorage.removeItem(STORAGE_KEYS.LAST_DASHBOARD);
}
