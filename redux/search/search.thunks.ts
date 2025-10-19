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
  const term = (q.search ?? q.q ?? "").trim();
  if (term) p.set("search", term);

  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));

  const s = p.toString();
  return s ? `?${s}` : "";
};

const mapItem = (x: RawSearchItem): SearchItem => {
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
    const term = (query.search ?? query.q ?? "").trim();
    if (!term) {
      return rejectWithValue("Please enter a search term.");
    }

    const url = `${BASE}${buildQuery(query)}`;
    const res = await api.get(url);
    const data = res.data as SearchListResponse;
    return {
      items: (data.items ?? []).map(mapItem),
      meta: data.meta,
    };
  } catch (err: any) {
    // optional: keep the url in your logs for debugging
    console.log(
      "SEARCH ERROR",
      `${BASE}${buildQuery(query)}`,
      err?.response?.data
    );
    return rejectWithValue(err?.response?.data?.error || "Failed to search");
  }
});
