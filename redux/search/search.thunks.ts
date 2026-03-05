import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { boolToQueryString, compactQuery, getApiErrorMessage } from "@/api/http";
import { getStorageFileUrl } from "@/api/storage";
import type {
  SearchListResponse,
  SearchQuery,
  SearchItem,
} from "./search.types";

type BackendMeal = {
  id: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  kitchen_id: string;
  is_available: boolean;
  likes: number;
  rating: number;
  cover_image_id: string;
  created_at: number;
  updated_at: number | null;
};

type BackendKitchen = {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  type: string;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  city_id: string;
  city?: {
    id: string;
    name: string;
    state: string;
    created_at: number;
    updated_at: number | null;
  };
  owner_id: string;
  is_available: boolean;
  likes: number;
  rating: number;
  cover_image_id: string | null;
  created_at: number;
  updated_at: number | null;
};

type MealsResponse = {
  items: BackendMeal[];
  meta: { page: number; per_page: number; total: number };
};

type KitchensResponse = {
  items: BackendKitchen[];
  meta: { page: number; per_page: number; total: number };
};

const mapMeal = (m: BackendMeal): SearchItem => ({
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
  cover_image: m.cover_image_id
    ? {
        public_id: m.cover_image_id,
        timestamp: Date.now(),
        url: getStorageFileUrl(m.cover_image_id) ?? "",
      }
    : null,
  created_at: String(m.created_at),
  updated_at: m.updated_at ? String(m.updated_at) : null,
});

const mapKitchen = (k: BackendKitchen): SearchItem => ({
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
  cover_image: k.cover_image_id ? getStorageFileUrl(k.cover_image_id) : null,
  city_id: k.city_id ?? null,
  city: k.city
    ? {
        id: k.city.id,
        name: k.city.name,
        state: k.city.state,
        created_at: String(k.city.created_at),
        updated_at: k.city.updated_at ? String(k.city.updated_at) : null,
      }
    : undefined,
  created_at: String(k.created_at),
  updated_at: k.updated_at ? String(k.updated_at) : null,
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

    const params = compactQuery({
      page: query.page ?? 1,
      per_page: query.per_page ?? 20,
      search: term,
    });

    const [mealsRes, kitchensRes] = await Promise.all([
      api.get<MealsResponse>("/meals", {
        params,
      }),
      api.get<KitchensResponse>("/kitchens", {
        params: compactQuery({
          ...params,
          is_available: boolToQueryString(true),
        }),
      }),
    ]);

    const items = [
      ...(kitchensRes.data.items ?? []).map(mapKitchen),
      ...(mealsRes.data.items ?? []).map(mapMeal),
    ];

    const data: SearchListResponse = {
      items,
      meta: {
        page: query.page ?? 1,
        per_page: query.per_page ?? 20,
        total: items.length,
      },
    };

    return {
      items: data.items as SearchItem[],
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to search"));
  }
});
