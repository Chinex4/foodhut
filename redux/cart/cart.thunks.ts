import { createAsyncThunk } from "@reduxjs/toolkit";
import { addMockOrder } from "@/redux/orders/orders.thunks";
import { mockKitchens, mockMeals, mockUser } from "@/utils/mockData";
import type {
  ActiveCartResponse,
  CheckoutPayload,
  CheckoutResult,
  SetCartItemPayload,
  KitchenId,
  MealId,
} from "./cart.types";

import type { Order } from "@/redux/orders/orders.types";

let activeCart: ActiveCartResponse = [];

const toKitchenSummary = (k: any) => ({
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

const toMealSummary = (m: any) => ({
  id: m.id,
  name: m.name,
  description: m.description,
  price: m.price,
  original_price: m.original_price,
  is_available: m.is_available,
  likes: m.likes ?? 0,
  rating: m.rating ?? 0,
  kitchen_id: m.kitchen_id,
  cover_image: m.cover_image
    ? { public_id: "mock", timestamp: Date.now(), url: m.cover_image.url }
    : null,
  created_at: new Date().toISOString(),
  updated_at: null,
});

const findMeal = (mealId: MealId) => mockMeals.find((m) => m.id === mealId);
const findKitchen = (kitchenId: KitchenId) =>
  mockKitchens.find((k) => k.id === kitchenId);

const findGroupIndex = (kitchenId: KitchenId) =>
  activeCart.findIndex((g) => g.kitchen.id === kitchenId);

export const fetchActiveCart = createAsyncThunk<
  ActiveCartResponse,
  void,
  { rejectValue: string }
>("cart/fetchActiveCart", async (_, { rejectWithValue }) => {
  try {
    return activeCart;
  } catch (err: any) {
    return rejectWithValue(
      "Failed to load cart"
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
    const meal = findMeal(mealId);
    if (!meal) return rejectWithValue("Meal not found");
    const kitchen = findKitchen(meal.kitchen_id);
    if (!kitchen) return rejectWithValue("Kitchen not found");

    const groupIndex = findGroupIndex(kitchen.id);
    if (quantity <= 0) {
      if (groupIndex >= 0) {
        activeCart[groupIndex].meals = activeCart[groupIndex].meals.filter(
          (m) => m.meal.id !== mealId
        );
        if (activeCart[groupIndex].meals.length === 0) {
          activeCart.splice(groupIndex, 1);
        }
      }
    } else if (groupIndex >= 0) {
      const entry = activeCart[groupIndex].meals.find(
        (m) => m.meal.id === mealId
      );
      if (entry) {
        entry.quantity = quantity;
      } else {
        activeCart[groupIndex].meals.push({
          meal: toMealSummary(meal),
          quantity,
        });
      }
    } else {
      activeCart.push({
        kitchen: toKitchenSummary(kitchen),
        meals: [{ meal: toMealSummary(meal), quantity }],
      });
    }

    return {
      message: "Cart updated successfully",
      cart: activeCart,
      mealId,
      quantity,
    };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to update cart"
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
    activeCart = activeCart
      .map((g) => ({
        ...g,
        meals: g.meals.filter((m) => m.meal.id !== mealId),
      }))
      .filter((g) => g.meals.length > 0);
    return {
      message: "Meal removed from cart successfully",
      cart: activeCart,
      mealId,
    };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to remove item"
    );
  }
});

export const clearKitchenCart = createAsyncThunk<
  { message: string; cart: ActiveCartResponse; kitchenId: KitchenId },
  KitchenId,
  { rejectValue: string }
>("cart/clearKitchenCart", async (kitchenId, { rejectWithValue }) => {
  try {
    activeCart = activeCart.filter((g) => g.kitchen.id !== kitchenId);
    return {
      message: "Items removed from cart",
      cart: activeCart,
      kitchenId,
    };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to clear kitchen cart"
    );
  }
});

export const checkoutActiveCart = createAsyncThunk<
  { result: CheckoutResult; cart: ActiveCartResponse },
  CheckoutPayload,
  { rejectValue: string }
>("cart/checkoutActiveCart", async (body, { rejectWithValue }) => {
  try {
    const { kitchen_id, ...rest } = body;
    const group = activeCart.find((g) => g.kitchen.id === kitchen_id);
    if (!group) return rejectWithValue("No active cart for this kitchen");

    const order: Order = {
      id: `order-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: null,
      delivery_address: rest.delivery_address,
      delivery_date: rest.delivery_date ? String(rest.delivery_date) : null,
      dispatch_rider_note: rest.dispatch_rider_note,
      kitchen_id: group.kitchen.id,
      kitchen: group.kitchen,
      owner_id: mockUser.id,
      owner: {
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        phone_number: mockUser.phone_number,
      },
      payment_method: "ONLINE",
      status: "AWAITING_PAYMENT",
      items: group.meals.map((m, idx) => ({
        id: `order-item-${idx}`,
        meal_id: m.meal.id,
        meal: m.meal,
        price: m.meal.price,
        quantity: m.quantity,
      })),
      sub_total: group.meals.reduce(
        (sum, it) => sum + Number(it.meal.price) * it.quantity,
        0
      ),
      total: group.meals.reduce(
        (sum, it) => sum + Number(it.meal.price) * it.quantity,
        0
      ),
    };
    addMockOrder(order);
    activeCart = activeCart.filter((g) => g.kitchen.id !== kitchen_id);
    return {
      result: {
        id: order.id,
        message: "Cart checked out successfully",
      },
      cart: activeCart,
    };
  } catch (err: any) {
    return rejectWithValue("Failed to checkout");
  }
});
