// redux/search/search.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  SearchListResponse,
  SearchQuery,
  SearchItem,
  RawSearchItem,
} from "./search.types";

const BASE = "/search";

const buildQuery = (q: SearchQuery) => {
  const p = new URLSearchParams();
  p.set("q", q.q);
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  const s = p.toString();
  return s ? `?${s}` : "";
};

// map raw API items → discriminated union
const mapItem = (x: RawSearchItem): SearchItem => {
  // crude check: if "address" exists, it’s a kitchen; if "description"/"price" exist, it’s a meal
  if (typeof x === "object" && x && "address" in x) {
    return { kind: "kitchen", ...(x as any) };
  }
  return { kind: "meal", ...(x as any) };
};

export const searchMealsAndKitchens = createAsyncThunk<
  { items: SearchItem[]; meta: SearchListResponse["meta"] },
  SearchQuery,
  { rejectValue: string }
>("search/searchMealsAndKitchens", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}${buildQuery(query)}`);
    const data = res.data as SearchListResponse;
    return {
      items: (data.items ?? []).map(mapItem),
      meta: data.meta,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to search");
  }
});
