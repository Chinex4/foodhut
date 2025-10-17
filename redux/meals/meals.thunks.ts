// redux/meals/meals.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  CreateMealPayload,
  Meal,
  MealsListResponse,
  MealsQuery,
  UpdateMealPayload,
} from "./meals.types";

const BASE = "/meals";

const buildQuery = (q?: MealsQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const createMeal = createAsyncThunk<
  { id?: string; message: string },
  CreateMealPayload,
  { rejectValue: string }
>("meals/createMeal", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("name", String(payload.name));
    form.append("description", String(payload.description));
    form.append("price", String(payload.price));
    if (payload.cover) {
      // @ts-ignore RN FormData shape
      form.append("cover_image" as any, {
        uri: payload.cover.uri,
        name: payload.cover.name ?? "meal.jpg",
        type: payload.cover.type ?? "image/jpeg",
      });
    }

    const res = await api.post(`${BASE}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      id: res.data?.id as string | undefined,
      message: res.data?.message ?? res.data?.data ?? "Meal created!",
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to create meal"
    );
  }
});

export const fetchMeals = createAsyncThunk<
  MealsListResponse,
  MealsQuery | undefined,
  { rejectValue: string }
>("meals/fetchMeals", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}${buildQuery(query)}`);
    return res.data as MealsListResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch meals"
    );
  }
});

export const fetchMealById = createAsyncThunk<
  Meal,
  string,
  { rejectValue: string }
>("meals/fetchMealById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as Meal;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch meal"
    );
  }
});

export const updateMealById = createAsyncThunk<
  { message: string; id: string; meal?: Meal },
  { id: string; body: UpdateMealPayload },
  { rejectValue: string }
>("meals/updateMealById", async ({ id, body }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    if (body.name !== undefined) form.append("name", String(body.name));
    if (body.description !== undefined)
      form.append("description", String(body.description));
    if (body.price !== undefined) form.append("price", String(body.price));
    if (body.is_available !== undefined)
      form.append("is_available", String(body.is_available));
    if (body.cover) {
      // @ts-ignore RN FormData shape
      form.append("cover_image" as any, {
        uri: body.cover.uri,
        name: body.cover.name ?? "meal.jpg",
        type: body.cover.type ?? "image/jpeg",
      });
    }

    const res = await api.patch(`${BASE}/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const latest = await api.get(`${BASE}/${id}`);
    return {
      message: res.data?.message ?? "Meal updated successfully",
      id,
      meal: latest.data as Meal,
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to update meal"
    );
  }
});

export const likeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/likeMeal", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/like`);
    return { message: res.data?.message ?? "Meal liked successfully", id };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to like meal");
  }
});

export const unlikeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/unlikeMeal", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/unlike`);
    return { message: res.data?.message ?? "Meal unliked successfully", id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to unlike meal"
    );
  }
});

export const deleteMealById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/deleteMealById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`${BASE}/${id}`);
    return { message: res.data?.message ?? "Meal deleted successfully", id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to delete meal"
    );
  }
});
