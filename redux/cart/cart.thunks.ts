import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { getMediaUrl } from "@/api/storage";
import type {
  ActiveCartResponse,
  CheckoutPayload,
  CheckoutResult,
  KitchenId,
  KitchenSummary,
  MealId,
  MealSummary,
  SetCartItemPayload,
} from "./cart.types";

type BackendCartItem = {
  meal_id: string;
  quantity: number;
};

type BackendCart = {
  id: string;
  items: BackendCartItem[];
  status: "CHECKED_OUT" | "NOT_CHECKED_OUT";
  owner_id: string;
  created_at: number;
  updated_at: number | null;
};

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
  cover_image_id: string | null;
  cover_image?: {
    id: string;
    url?: string | null;
    meta?: Record<string, string | null | undefined> | null;
  } | null;
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
  cover_image?: {
    id: string;
    url?: string | null;
    meta?: Record<string, string | null | undefined> | null;
  } | null;
  created_at: number;
  updated_at: number | null;
};

type CheckoutMealsFromKitchenSuccessResponse = {
  id: string;
  _tag: "CheckoutMealsFromKitchenSuccessResponse";
};

const mealCache = new Map<string, Promise<MealSummary>>();
const kitchenCache = new Map<string, Promise<KitchenSummary>>();

const fetchMealSummary = (mealId: string): Promise<MealSummary> => {
  const cached = mealCache.get(mealId);
  if (cached) return cached;

  const promise = api
    .get<BackendMeal>(`/meals/${mealId}`)
    .then(({ data }) => ({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.original_price,
      is_available: data.is_available,
      likes: data.likes,
      rating: data.rating,
      kitchen_id: data.kitchen_id,
      cover_image: getMediaUrl(data.cover_image, data.cover_image_id)
        ? {
            id: data.cover_image_id ?? data.cover_image?.id,
            url: getMediaUrl(data.cover_image, data.cover_image_id) ?? "",
          }
        : null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }))
    .catch(() => ({
      id: mealId,
      name: "Meal",
      description: "",
      price: "0",
      original_price: "0",
      is_available: true,
      likes: 0,
      rating: 0,
      kitchen_id: "",
      cover_image: null,
      created_at: Date.now(),
      updated_at: null,
    }));

  mealCache.set(mealId, promise);
  return promise;
};

const fetchKitchenSummary = (kitchenId: string): Promise<KitchenSummary> => {
  const cached = kitchenCache.get(kitchenId);
  if (cached) return cached;

  const promise = api
    .get<BackendKitchen>(`/kitchens/${kitchenId}`)
    .then(({ data }) => ({
      id: data.id,
      name: data.name,
      address: data.address,
      phone_number: data.phone_number,
      type: data.type,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      delivery_time: data.delivery_time,
      preparation_time: data.preparation_time,
      rating: data.rating,
      likes: data.likes,
      is_available: data.is_available,
      owner_id: data.owner_id,
      cover_image: getMediaUrl(data.cover_image, data.cover_image_id)
        ? {
            id: data.cover_image_id ?? data.cover_image?.id,
            url: getMediaUrl(data.cover_image, data.cover_image_id) ?? "",
          }
        : null,
      city_id: data.city_id,
      city: data.city,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }))
    .catch(() => ({
      id: kitchenId,
      name: "Kitchen",
      address: "",
      phone_number: "",
      type: "",
      opening_time: "",
      closing_time: "",
      delivery_time: "",
      preparation_time: "",
      rating: 0,
      likes: 0,
      is_available: true,
      owner_id: "",
      cover_image: null,
      city_id: null,
      created_at: Date.now(),
      updated_at: null,
    }));

  kitchenCache.set(kitchenId, promise);
  return promise;
};

const fetchHydratedCart = async (): Promise<ActiveCartResponse> => {
  const { data } = await api.get<BackendCart>("/carts");
  const items = data?.items ?? [];

  if (!items.length) return [];

  const mealEntries = await Promise.all(
    items.map(async (item) => ({
      quantity: item.quantity,
      meal: await fetchMealSummary(item.meal_id),
    }))
  );

  const grouped = new Map<
    string,
    {
      meals: { meal: MealSummary; quantity: number }[];
    }
  >();

  for (const entry of mealEntries) {
    const kitchenId = entry.meal.kitchen_id;
    if (!grouped.has(kitchenId)) grouped.set(kitchenId, { meals: [] });
    grouped.get(kitchenId)!.meals.push({
      meal: entry.meal,
      quantity: entry.quantity,
    });
  }

  const kitchens = await Promise.all(
    Array.from(grouped.keys()).map(async (kitchenId) => [
      kitchenId,
      await fetchKitchenSummary(kitchenId),
    ] as const)
  );

  const kitchenMap = new Map(kitchens);

  return Array.from(grouped.entries()).map(([kitchenId, group]) => ({
    kitchen:
      kitchenMap.get(kitchenId) ??
      ({
        id: kitchenId,
        name: "Kitchen",
        address: "",
        phone_number: "",
        type: "",
        opening_time: "",
        closing_time: "",
        delivery_time: "",
        preparation_time: "",
        rating: 0,
        likes: 0,
        is_available: true,
        owner_id: "",
        cover_image: null,
        city_id: null,
        created_at: Date.now(),
        updated_at: null,
      } as KitchenSummary),
    meals: group.meals,
  }));
};

export const fetchActiveCart = createAsyncThunk<
  ActiveCartResponse,
  void,
  { rejectValue: string }
>("cart/fetchActiveCart", async (_, { rejectWithValue }) => {
  try {
    return await fetchHydratedCart();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load cart"));
  }
});

export const setCartItem = createAsyncThunk<
  {
    message: string;
    cart: ActiveCartResponse;
    mealId: MealId;
    quantity: number;
  },
  SetCartItemPayload,
  { rejectValue: string }
>("cart/setCartItem", async ({ mealId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put<{ message?: string }>(`/carts/items/${mealId}`, {
      quantity,
    });

    const cart = await fetchHydratedCart();

    return {
      message: data?.message ?? "Cart updated successfully",
      cart,
      mealId,
      quantity,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update cart"));
  }
});

export const removeCartItem = createAsyncThunk<
  { message: string; cart: ActiveCartResponse; mealId: MealId },
  MealId,
  { rejectValue: string }
>("cart/removeCartItem", async (mealId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete<{ message?: string }>(`/carts/items/${mealId}`);
    const cart = await fetchHydratedCart();

    return {
      message: data?.message ?? "Meal removed from cart successfully",
      cart,
      mealId,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to remove item"));
  }
});

export const clearKitchenCart = createAsyncThunk<
  { message: string; cart: ActiveCartResponse; kitchenId: KitchenId },
  KitchenId,
  { rejectValue: string }
>("cart/clearKitchenCart", async (kitchenId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete<{ message?: string }>(`/carts/kitchens/${kitchenId}`);
    const cart = await fetchHydratedCart();

    return {
      message: data?.message ?? "Items removed from cart",
      cart,
      kitchenId,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to clear kitchen cart"));
  }
});

export const checkoutActiveCart = createAsyncThunk<
  { result: CheckoutResult; cart: ActiveCartResponse },
  CheckoutPayload,
  { rejectValue: string }
>("cart/checkoutActiveCart", async (body, { rejectWithValue }) => {
  try {
    const { kitchen_id, rider_id, ...rest } = body;

    const { data } = await api.post<CheckoutMealsFromKitchenSuccessResponse>(
      `/carts/kitchens/${kitchen_id}/checkout`,
      {
        payment_method: rest.payment_method,
        dispatch_rider_note: rest.dispatch_rider_note,
        delivery_address: rest.delivery_address,
        delivery_date: rest.delivery_date ?? Date.now(),
      }
    );

    const cart = await fetchHydratedCart();

    return {
      result: {
        id: data.id,
        message: "Cart checked out successfully",
      },
      cart,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to checkout"));
  }
});
