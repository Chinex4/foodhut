import { AxiosError } from "axios";

type ApiIssue = {
  message?: string;
  path?: (string | number | { key?: string })[];
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
  _tag?: string;
  issues?: ApiIssue[];
};

const titleizeTag = (tag?: string): string | null => {
  if (!tag) return null;
  const cleaned = tag.replace(/Error$/, "");
  const withSpaces = cleaned.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces || null;
};

const issuePathToString = (path?: ApiIssue["path"]): string => {
  if (!path?.length) return "";
  const parts = path.map((p) => {
    if (typeof p === "string" || typeof p === "number") return String(p);
    return p?.key ? String(p.key) : "";
  });
  return parts.filter(Boolean).join(".");
};

const getBackendErrorMessage = (payload?: ApiErrorPayload | ApiErrorPayload[]): string | null => {
  if (Array.isArray(payload) && payload.length) {
    const first = payload[0];
    if (first?.message) return first.message;
    if (first?.error) return first.error;
    if (first?._tag) return titleizeTag(first._tag);
    return null;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") return null;
  if (payload.message) return payload.message;
  if (payload.error) return payload.error;

  const firstIssue = payload.issues?.[0];
  if (firstIssue?.message) {
    const path = issuePathToString(firstIssue.path);
    return path ? `${path}: ${firstIssue.message}` : firstIssue.message;
  }

  if (payload._tag) return titleizeTag(payload._tag);
  return null;
};

const friendlyFromFallback = (fallback: string) => {
  const normalized = fallback.trim().replace(/\.$/, "");
  const lower = normalized.toLowerCase();
  const object = normalized
    .replace(/^(failed|unable) to\s+(fetch|load|create|update|delete|remove|upload|search)\s+/i, "")
    .replace(/^(failed|unable) to\s+/i, "")
    .trim();

  if (lower.includes("sign up")) {
    return "We couldn't create your account right now. Please check your details and try again.";
  }
  if (lower.includes("otp") || lower.includes("verification")) {
    return "We couldn't complete verification right now. Please check the code and try again.";
  }
  if (lower.includes("payment") || lower.includes("pay")) {
    return "We couldn't start your payment right now. Please try again.";
  }
  if (lower.includes("upload")) {
    return "We couldn't upload that file. Please try again.";
  }
  if (lower.includes("withdraw")) {
    return "We couldn't process your withdrawal right now. Please try again.";
  }
  if (lower.includes("checkout")) {
    return "We couldn't place your order right now. Please try again.";
  }
  if (lower.includes("fetch") || lower.includes("load")) {
    return `We couldn't load ${object || "that information"} right now. Please try again.`;
  }
  if (lower.includes("create")) {
    return `We couldn't create ${object || "that item"} right now. Please try again.`;
  }
  if (lower.includes("update")) {
    return `We couldn't update ${object || "that item"} right now. Please try again.`;
  }
  if (lower.includes("delete") || lower.includes("remove")) {
    return `We couldn't remove ${object || "that item"} right now. Please try again.`;
  }
  if (lower.includes("search")) {
    return "We couldn't complete that search right now. Please try again.";
  }

  return normalized || "Something went wrong. Please try again.";
};

export const getFriendlyApiErrorMessage = (
  status?: number,
  fallback = "Request failed",
  axiosMessage?: string
): string => {
  const lowerAxiosMessage = axiosMessage?.toLowerCase() ?? "";

  if (!status) {
    if (lowerAxiosMessage.includes("timeout")) {
      return "The request took too long. Please check your connection and try again.";
    }
    return "We couldn't connect. Please check your internet connection and try again.";
  }

  if (status === 400 || status === 422) {
    return "Some information looks incorrect. Please review it and try again.";
  }
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 403) {
    return "You don't have permission to do that.";
  }
  if (status === 404) {
    return "We couldn't find what you're looking for.";
  }
  if (status === 409) {
    return "That action conflicts with the latest information. Please refresh and try again.";
  }
  if (status === 429) {
    return "You're doing that too quickly. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "Something went wrong on our side. Please try again shortly.";
  }

  return friendlyFromFallback(fallback);
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Request failed"
): string => {
  if (error && typeof error === "object" && "response" in (error as any)) {
    const axiosErr = error as AxiosError<ApiErrorPayload | ApiErrorPayload[]>;
    const payload = axiosErr.response?.data;
    const backendMessage = getBackendErrorMessage(payload);

    if (backendMessage) {
      console.log("[API BACKEND ERROR MESSAGE]", backendMessage);
    }

    return getFriendlyApiErrorMessage(
      axiosErr.response?.status,
      fallback,
      axiosErr.message
    );
  }

  if (typeof error === "string") return friendlyFromFallback(error);
  if (error instanceof Error && error.message) return friendlyFromFallback(fallback);

  return friendlyFromFallback(fallback);
};

export const toNumberString = (value: number | string): string => String(value);

export const boolToQueryString = (value?: boolean): "true" | "false" | undefined => {
  if (value === undefined) return undefined;
  return value ? "true" : "false";
};

export const compactQuery = (
  query: Record<string, string | number | boolean | undefined | null>
): Record<string, string> => {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = String(value);
  }
  return params;
};
