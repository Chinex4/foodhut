import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockMeals } from "@/utils/mockData";
import type {
  CreateMealPayload,
  Meal,
  MealsListResponse,
  MealsQuery,
  UpdateMealPayload,
} from "./meals.types";

const now = new Date().toISOString();

const toMeal = (m: any): Meal => ({
  id: m.id,
  name: m.name,
  description: m.description,
  price: m.price,
  original_price: m.original_price,
  is_available: m.is_available,
  in_cart: false,
  likes: m.likes ?? 0,
  rating: m.rating ?? 0,
  kitchen_id: m.kitchen_id,
  cover_image: m.cover_image
    ? {
        public_id: "mock",
        timestamp: Date.now(),
        url: m.cover_image.url,
      }
    : null,
  created_at: now,
  updated_at: null,
});

let meals: Meal[] = mockMeals.map(toMeal);

const buildQuery = (q?: MealsQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  if (q.kitchen_id) p.set("kitchen_id", q.kitchen_id);
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const createMeal = createAsyncThunk<
  { id?: string; message: string },
  CreateMealPayload,
  { rejectValue: string }
>("meals/createMeal", async (payload, { rejectWithValue }) => {
  try {
    const created: Meal = {
      id: `meal-${meals.length + 1}`,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      original_price: undefined,
      is_available: true,
      likes: 0,
      rating: 0,
      kitchen_id: "kitchen-1",
      cover_image: payload.cover
        ? {
            public_id: "mock",
            timestamp: Date.now(),
            url: payload.cover.uri,
          }
        : null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    meals = [created, ...meals];
    return {
      id: created.id,
      message: "Meal created!",
    };
  } catch (err: any) {
    return rejectWithValue("Failed to create meal");
  }
});

export const fetchMeals = createAsyncThunk<
  MealsListResponse,
  MealsQuery | undefined,
  { rejectValue: string }
>("meals/fetchMeals", async (query, { rejectWithValue }) => {
  try {
    const page = query?.page ?? 1;
    const perPage = query?.per_page ?? meals.length;
    const filtered = query?.kitchen_id
      ? meals.filter((m) => m.kitchen_id === query.kitchen_id)
      : meals;
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage);
    return {
      items,
      meta: {
        page,
        per_page: perPage,
        total: filtered.length,
      },
    };
  } catch (err: any) {
    return rejectWithValue("Failed to fetch meals");
  }
});

export const fetchMealById = createAsyncThunk<
  Meal,
  string,
  { rejectValue: string }
>("meals/fetchMealById", async (id, { rejectWithValue }) => {
  try {
    const found = meals.find((m) => m.id === id);
    if (!found) return rejectWithValue("Failed to fetch meal");
    return found;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch meal");
  }
});

export const updateMealById = createAsyncThunk<
  { message: string; id: string; meal?: Meal },
  { id: string; body: UpdateMealPayload },
  { rejectValue: string }
>("meals/updateMealById", async ({ id, body }, { rejectWithValue }) => {
  try {
    meals = meals.map((m) =>
      m.id === id
        ? {
            ...m,
            name: body.name ?? m.name,
            description: body.description ?? m.description,
            price: body.price ?? m.price,
            is_available:
              body.is_available !== undefined ? body.is_available : m.is_available,
            cover_image: body.cover
              ? {
                  public_id: "mock",
                  timestamp: Date.now(),
                  url: body.cover.uri,
                }
              : m.cover_image,
            updated_at: new Date().toISOString(),
          }
        : m
    );
    const latest = meals.find((m) => m.id === id);
    return {
      message: "Meal updated successfully",
      id,
      meal: latest,
    };
  } catch (err: any) {
    return rejectWithValue("Failed to update meal");
  }
});

export const likeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/likeMeal", async (id, { rejectWithValue }) => {
  try {
    meals = meals.map((m) =>
      m.id === id ? { ...m, is_liked: true, likes: (m.likes ?? 0) + 1 } : m
    );
    return { message: "Meal liked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to like meal");
  }
});

export const unlikeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/unlikeMeal", async (id, { rejectWithValue }) => {
  try {
    meals = meals.map((m) =>
      m.id === id
        ? { ...m, is_liked: false, likes: Math.max(0, (m.likes ?? 0) - 1) }
        : m
    );
    return { message: "Meal unliked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to unlike meal");
  }
});

export const deleteMealById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/deleteMealById", async (id, { rejectWithValue }) => {
  try {
    meals = meals.filter((m) => m.id !== id);
    return { message: "Meal deleted successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to delete meal");
  }
});
