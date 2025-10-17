import { createSlice } from "@reduxjs/toolkit";
import type {
  ActiveCartResponse,
  CartState,
  KitchenId,
  MealId,
  CartMeal,
} from "./cart.types";
import {
  checkoutActiveCart,
  clearKitchenCart,
  fetchActiveCart,
  removeCartItem,
  setCartItem,
} from "./cart.thunks";

const initialState: CartState = {
  kitchenIds: [],
  byKitchenId: {},

  fetchStatus: "idle",
  setItemStatus: {},
  removeItemStatus: {},
  clearKitchenStatus: {},
  checkoutStatus: "idle",

  error: null,
};

const rehydrateFromApi = (state: CartState, groups: ActiveCartResponse) => {
  state.kitchenIds = [];
  state.byKitchenId = {};

  for (const g of groups) {
    const k = g.kitchen;
    const kid = k.id as KitchenId;

    state.kitchenIds.push(kid);
    state.byKitchenId[kid] = {
      kitchen: k,
      items: {},
      itemOrder: [],
    };

    for (const entry of g.meals) {
      const mealId = entry.meal.id as MealId;
      state.byKitchenId[kid].items[mealId] = entry as CartMeal;
      state.byKitchenId[kid].itemOrder.push(mealId);
    }
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // --- Fetch
    builder
      .addCase(fetchActiveCart.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchActiveCart.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        rehydrateFromApi(state, action.payload);
      })
      .addCase(fetchActiveCart.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = (action.payload as string) || "Failed to load cart";
      });

    // --- Set item
    builder
      .addCase(setCartItem.pending, (state, action) => {
        state.setItemStatus[action.meta.arg.mealId] = "loading";
        state.error = null;
      })
      .addCase(setCartItem.fulfilled, (state, action) => {
        const { cart, mealId } = action.payload;
        state.setItemStatus[mealId] = "succeeded";
        rehydrateFromApi(state, cart);
      })
      .addCase(setCartItem.rejected, (state, action) => {
        const mealId = action.meta.arg.mealId;
        state.setItemStatus[mealId] = "failed";
        state.error = (action.payload as string) || "Failed to update cart";
      });

    // --- Remove item
    builder
      .addCase(removeCartItem.pending, (state, action) => {
        state.removeItemStatus[action.meta.arg] = "loading";
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const { cart, mealId } = action.payload;
        state.removeItemStatus[mealId] = "succeeded";
        rehydrateFromApi(state, cart);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const mealId = action.meta.arg;
        state.removeItemStatus[mealId] = "failed";
        state.error = (action.payload as string) || "Failed to remove item";
      });

    // --- Clear kitchen
    builder
      .addCase(clearKitchenCart.pending, (state, action) => {
        state.clearKitchenStatus[action.meta.arg] = "loading";
        state.error = null;
      })
      .addCase(clearKitchenCart.fulfilled, (state, action) => {
        const { cart, kitchenId } = action.payload;
        state.clearKitchenStatus[kitchenId] = "succeeded";
        rehydrateFromApi(state, cart);
      })
      .addCase(clearKitchenCart.rejected, (state, action) => {
        const kitchenId = action.meta.arg;
        state.clearKitchenStatus[kitchenId] = "failed";
        state.error =
          (action.payload as string) || "Failed to clear kitchen cart";
      });

    // --- Checkout
    builder
      .addCase(checkoutActiveCart.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = null;
      })
      .addCase(checkoutActiveCart.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        rehydrateFromApi(state, action.payload.cart);
      })
      .addCase(checkoutActiveCart.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = (action.payload as string) || "Failed to checkout";
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
