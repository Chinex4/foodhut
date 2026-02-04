// redux/search/search.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockKitchens, mockMeals } from "@/utils/mockData";
import type {
  SearchListResponse,
  SearchQuery,
  SearchItem,
  RawSearchItem,
} from "./search.types";

const mapMeal = (m: any): SearchItem => ({
  kind: "meal",
  id: m.id,
  name: m.name,
  description: m.description,
  price: m.price,
  original_price: m.original_price,
  rating: m.rating ?? 0,
  likes: m.likes ?? 0,
  is_available: m.is_available,
  kitchen_id: m.kitchen_id,
  cover_image: m.cover_image
    ? {
        public_id: "mock",
        timestamp: Date.now(),
        url: m.cover_image.url,
      }
    : null,
  created_at: new Date().toISOString(),
  updated_at: null,
});

const mapKitchen = (k: any): SearchItem => ({
  kind: "kitchen",
  id: k.id,
  name: k.name,
  address: k.address,
  phone_number: k.phone_number,
  type: k.type ?? "Cuisine",
  opening_time: k.opening_time ?? "08:00",
  closing_time: k.closing_time ?? "20:00",
  delivery_time: k.delivery_time ?? "25-35 mins",
  preparation_time: k.preparation_time ?? "20-30 mins",
  rating: k.rating ?? 0,
  likes: k.likes ?? 0,
  is_available: k.is_available,
  owner_id: k.owner_id,
  cover_image: k.cover_image?.url ?? null,
  city_id: k.city_id ?? null,
  city: k.city
    ? {
        id: k.city.id,
        name: k.city.name,
        state: k.city.state,
        created_at: new Date().toISOString(),
        updated_at: null,
      }
    : undefined,
  created_at: new Date().toISOString(),
  updated_at: null,
});

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

    const lower = term.toLowerCase();
    const meals = mockMeals.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.description.toLowerCase().includes(lower)
    );
    const kitchens = mockKitchens.filter(
      (k) =>
        k.name.toLowerCase().includes(lower) ||
        (k.type ?? "").toLowerCase().includes(lower)
    );

    const items = [
      ...kitchens.map(mapKitchen),
      ...meals.map(mapMeal),
    ];
    const perPage = query.per_page ?? items.length;
    const page = query.page ?? 1;
    const start = (page - 1) * perPage;
    const pagedItems = items.slice(start, start + perPage);
    const data: SearchListResponse = {
      items: pagedItems as RawSearchItem[],
      meta: {
        page,
        per_page: perPage,
        total: items.length,
      },
    };
    return {
      items: (data.items ?? []) as SearchItem[],
      meta: data.meta,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to search");
  }
});
