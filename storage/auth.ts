import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

export async function saveToken(token: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}
export async function clearToken() {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function saveRefreshToken(token: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}
export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}
export async function clearRefreshToken() {
  await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function saveUser<T = unknown>(user: T) {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}
export async function getUser<T = unknown>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return raw ? (JSON.parse(raw) as T) : null;
}
export async function clearUser() {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function getStoredAuth() {
  const [access, refresh, userRaw] = await Promise.all([
    getToken(),
    getRefreshToken(),
    AsyncStorage.getItem(STORAGE_KEYS.USER),
  ]);
  return {
    accessToken: access,
    refreshToken: refresh,
    user: userRaw ? JSON.parse(userRaw) : null,
  } as {
    accessToken: string | null;
    refreshToken: string | null;
    user: unknown | null;
  };
}
