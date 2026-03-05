import { AxiosError } from "axios";

type ApiIssue = {
  message?: string;
  path?: Array<string | number | { key?: string }>;
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

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Request failed"
): string => {
  if (error && typeof error === "object" && "response" in (error as any)) {
    const axiosErr = error as AxiosError<ApiErrorPayload | ApiErrorPayload[]>;
    const payload = axiosErr.response?.data;

    if (Array.isArray(payload) && payload.length) {
      const first = payload[0];
      if (first?.message) return first.message;
      if (first?._tag) return titleizeTag(first._tag) ?? fallback;
    }

    if (payload && !Array.isArray(payload) && typeof payload === "object") {
      if (payload.message) return payload.message;
      if (payload.error) return payload.error;

      const firstIssue = payload.issues?.[0];
      if (firstIssue?.message) {
        const path = issuePathToString(firstIssue.path);
        return path ? `${path}: ${firstIssue.message}` : firstIssue.message;
      }

      if (payload._tag) return titleizeTag(payload._tag) ?? fallback;
    }

    if (axiosErr.message) return axiosErr.message;
  }

  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
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
