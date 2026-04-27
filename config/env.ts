export const ENV = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
    "https://api.staging.foodhut.co",
  REQUEST_TIMEOUT_MS: 15_000,
};
