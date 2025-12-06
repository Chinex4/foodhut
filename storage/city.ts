import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

export async function saveSelectedCity(city: KitchenCity) {
  await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CITY, JSON.stringify(city));
}

export async function getSelectedCity(): Promise<KitchenCity | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
  return raw ? (JSON.parse(raw) as KitchenCity) : null;
}

export async function clearSelectedCity() {
  await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_CITY);
}
