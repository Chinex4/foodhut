import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { boolToQueryString, compactQuery, getApiErrorMessage, toNumberString } from "@/api/http";
import { getStorageFileUrl, uploadSingleMedia } from "@/api/storage";
import type {
  CreateMealPayload,
  Meal,
  MealsListResponse,
  MealsQuery,
  UpdateMealPayload,
} from "./meals.types";

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
  discount: Meal["discount"];
  created_at: number;
  updated_at: number | null;
};

type FetchMealsSuccessResponse = {
  items: BackendMeal[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
  _tag: "FetchMealsSuccessResponse";
};

const toMeal = (meal: BackendMeal): Meal => ({
  id: meal.id,
  name: meal.name,
  description: meal.description,
  price: meal.price,
  original_price: meal.original_price,
  is_available: meal.is_available,
  in_cart: false,
  likes: meal.likes,
  rating: meal.rating,
  kitchen_id: meal.kitchen_id,
  cover_image_id: meal.cover_image_id,
  cover_image: meal.cover_image_id
    ? {
        id: meal.cover_image_id,
        url: getStorageFileUrl(meal.cover_image_id) ?? "",
      }
    : null,
  discount: meal.discount,
  created_at: meal.created_at,
  updated_at: meal.updated_at,
});

export const createMeal = createAsyncThunk<
  { id?: string; message: string },
  CreateMealPayload,
  { rejectValue: string }
>("meals/createMeal", async (payload, { rejectWithValue }) => {
  try {
    let coverImageId: string | null = payload.cover_image_id ?? null;
    if (!coverImageId && payload.cover) {
      const uploaded = await uploadSingleMedia(payload.cover);
      coverImageId = uploaded?.id ?? null;
    }

    if (!coverImageId) {
      return rejectWithValue("Meal cover image is required");
    }

    const { data } = await api.post<{ id: string }>("/meals", {
      name: payload.name,
      description: payload.description,
      original_price: toNumberString(payload.price),
      cover_image_id: coverImageId,
    });

    return {
      id: data?.id,
      message: "Meal created!",
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create meal"));
  }
});

export const fetchMeals = createAsyncThunk<
  MealsListResponse,
  MealsQuery | undefined,
  { rejectValue: string }
>("meals/fetchMeals", async (query, { rejectWithValue }) => {
  try {
    const params = compactQuery({
      page: query?.page,
      per_page: query?.per_page,
      kitchen_id: query?.kitchen_id,
      search: query?.search,
      is_liked: boolToQueryString(query?.is_liked),
    });

    const { data } = await api.get<FetchMealsSuccessResponse>("/meals", { params });

    return {
      items: (data.items ?? []).map(toMeal),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch meals"));
  }
});

export const fetchMealById = createAsyncThunk<Meal, string, { rejectValue: string }>(
  "meals/fetchMealById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendMeal>(`/meals/${id}`);
      return toMeal(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch meal"));
    }
  }
);

export const updateMealById = createAsyncThunk<
  { message: string; id: string; meal?: Meal },
  { id: string; body: UpdateMealPayload },
  { rejectValue: string }
>("meals/updateMealById", async ({ id, body }, { rejectWithValue }) => {
  try {
    let coverImageId = body.cover_image_id;
    if (body.cover) {
      const uploaded = await uploadSingleMedia(body.cover);
      coverImageId = uploaded?.id;
    }

    await api.patch(`/meals/${id}`, {
      name: body.name,
      description: body.description,
      original_price:
        body.price !== undefined ? toNumberString(body.price) : undefined,
      cover_image_id: coverImageId,
    });

    const refreshed = await api.get<BackendMeal>(`/meals/${id}`);
    return {
      message: "Meal updated successfully",
      id,
      meal: toMeal(refreshed.data),
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update meal"));
  }
});

export const likeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/likeMeal", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/meals/${id}/like`);
    return { message: "Meal liked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to like meal"));
  }
});

export const unlikeMeal = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/unlikeMeal", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/meals/${id}/unlike`);
    return { message: "Meal unliked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to unlike meal"));
  }
});

export const deleteMealById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("meals/deleteMealById", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/meals/${id}`);
    return { message: "Meal deleted successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to delete meal"));
  }
});
