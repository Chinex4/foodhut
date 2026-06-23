import axios, { AxiosError } from "axios";
import { ENV } from "@/config/env";
import { getToken, clearRefreshToken, clearToken, clearUser } from "@/storage/auth";
import type { RootStore } from "@/store";
// import { logout } from "@/redux/auth/auth.slice";
import { showError } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/api/http";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

let _store: RootStore | null = null;
let sessionExpiredHandled = false;

export const attachStore = (store: RootStore) => {
  _store = store;
};

const getRequestLabel = (config?: { method?: string; baseURL?: string; url?: string }) => {
  const method = (config?.method || "GET").toUpperCase();
  const url = `${config?.baseURL ?? ""}${config?.url ?? ""}`;
  return `${method} ${url}`;
};

const getAuthHeader = (headers: any) => {
  if (!headers) return null;
  if (typeof headers.get === "function") {
    return headers.get("Authorization") ?? headers.get("authorization");
  }
  return headers.Authorization ?? headers.authorization ?? null;
};

const isAuthEndpoint = (url?: string) => {
  return Boolean(url?.startsWith("/auth/"));
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    const authState = _store?.getState().auth;
    if (authState?.isAuthenticated && !authState.sessionExpired) {
      sessionExpiredHandled = false;
    }
  }
  console.log("[API REQUEST]", getRequestLabel(config), {
    params: config.params,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[API RESPONSE]", getRequestLabel(res.config), {
      status: res.status,
      data: res.data,
    });
    return res;
  },
  async (err: AxiosError<any>) => {
    const status = err.response?.status;

    console.log("[API ERROR]", getRequestLabel(err.config), {
      status,
      data: err.response?.data,
      message: err.message,
    });

    const friendlyMessage = getApiErrorMessage(err);

    if (status === 401) {
      const authState = _store?.getState().auth;
      const requestHadToken = Boolean(getAuthHeader(err.config?.headers));
      const shouldExpireSession =
        !isAuthEndpoint(err.config?.url) &&
        !sessionExpiredHandled &&
        !authState?.sessionExpired &&
        (requestHadToken || Boolean(authState?.isAuthenticated));

      if (shouldExpireSession) {
        sessionExpiredHandled = true;
        await clearToken();
        await clearRefreshToken();
        await clearUser();
        _store?.dispatch({ type: "auth/sessionExpired" });
        showError(friendlyMessage);
      }
    } else {
      showError(friendlyMessage);
    }
    return Promise.reject(err);
  }
);
