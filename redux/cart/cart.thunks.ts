import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  ActiveCartResponse,
  CheckoutPayload,
  CheckoutResult,
  SetCartItemPayload,
  KitchenId,
  MealId,
} from "./cart.types";

const BASE = "/carts";

export const fetchActiveCart = createAsyncThunk<
  ActiveCartResponse,
  void,
  { rejectValue: string }
>("cart/fetchActiveCart", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}`);
    return res.data as ActiveCartResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to load cart"
    );
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
    const res = await api.put(`${BASE}/active/items/${mealId}`, { quantity });
    const after = await api.get(`${BASE}`);
    return {
      message: res.data?.message ?? "Cart updated successfully",
      cart: after.data as ActiveCartResponse,
      mealId,
      quantity,
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to update cart"
    );
  }
});

// Remove meal from active cart
export const removeCartItem = createAsyncThunk<
  { message: string; cart: ActiveCartResponse; mealId: MealId },
  MealId,
  { rejectValue: string }
>("cart/removeCartItem", async (mealId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`${BASE}/active/items/${mealId}`);
    const after = await api.get(`${BASE}`);
    return {
      message: res.data?.message ?? "Meal removed from cart successfully",
      cart: after.data as ActiveCartResponse,
      mealId,
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to remove item"
    );
  }
});

export const clearKitchenCart = createAsyncThunk<
  { message: string; cart: ActiveCartResponse; kitchenId: KitchenId },
  KitchenId,
  { rejectValue: string }
>("cart/clearKitchenCart", async (kitchenId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`${BASE}/kitchens/${kitchenId}`);
    const after = await api.get(`${BASE}`);
    return {
      message: res.data?.message ?? "Items removed from cart",
      cart: after.data as ActiveCartResponse,
      kitchenId,
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to clear kitchen cart"
    );
  }
});

export const checkoutActiveCart = createAsyncThunk<
  { result: CheckoutResult; cart: ActiveCartResponse },
  CheckoutPayload,
  { rejectValue: string }
>("cart/checkoutActiveCart", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}/active/checkout`, body);
    const after = await api.get(`${BASE}`);
    return {
      result: {
        id: res.data?.id,
        message: res.data?.message ?? "Cart checkedout successfully",
      },
      cart: after.data as ActiveCartResponse,
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to checkout"
    );
  }
});
