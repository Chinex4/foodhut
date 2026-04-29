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
  optimisticSnapshots: {},
  latestSetItemRequestId: {},
  latestRemoveItemRequestId: {},
};

const snapshotCart = (state: CartState): ActiveCartResponse =>
  state.kitchenIds
    .map((kid) => {
      const group = state.byKitchenId[kid];
      if (!group) return null;
      return {
        kitchen: group.kitchen,
        meals: group.itemOrder
          .map((mealId) => group.items[mealId])
          .filter((item): item is CartMeal => Boolean(item)),
      };
    })
    .filter((group): group is ActiveCartResponse[number] => Boolean(group));

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

const createKitchenPlaceholder = (kitchenId: KitchenId) => ({
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
});

const applyOptimisticSetItem = (
  state: CartState,
  payload: {
    mealId: MealId;
    quantity: number;
    meal?: CartMeal["meal"];
    kitchen?: CartState["byKitchenId"][string]["kitchen"];
  }
) => {
  const { mealId, quantity } = payload;
  let kitchenId =
    payload.meal?.kitchen_id ??
    state.kitchenIds.find((kid) => Boolean(state.byKitchenId[kid]?.items[mealId]));

  if (!kitchenId) return;
  kitchenId = kitchenId as KitchenId;

  if (quantity <= 0) {
    const group = state.byKitchenId[kitchenId];
    if (!group?.items[mealId]) return;

    delete group.items[mealId];
    group.itemOrder = group.itemOrder.filter((id) => id !== mealId);

    if (group.itemOrder.length === 0) {
      delete state.byKitchenId[kitchenId];
      state.kitchenIds = state.kitchenIds.filter((id) => id !== kitchenId);
    }
    return;
  }

  if (!state.byKitchenId[kitchenId]) {
    state.kitchenIds.push(kitchenId);
    state.byKitchenId[kitchenId] = {
      kitchen: payload.kitchen ?? createKitchenPlaceholder(kitchenId),
      items: {},
      itemOrder: [],
    };
  }

  const group = state.byKitchenId[kitchenId];
  const existing = group.items[mealId];
  if (existing) {
    existing.quantity = quantity;
    return;
  }

  if (!payload.meal) return;

  group.items[mealId] = {
    meal: payload.meal,
    quantity,
  };
  group.itemOrder.push(mealId);
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
        const mealId = action.meta.arg.mealId;
        state.setItemStatus[mealId] = "loading";
        state.error = null;
        state.optimisticSnapshots[mealId] = snapshotCart(state);
        state.latestSetItemRequestId[mealId] = action.meta.requestId;
        delete state.latestRemoveItemRequestId[mealId];
        applyOptimisticSetItem(state, action.meta.arg);
      })
      .addCase(setCartItem.fulfilled, (state, action) => {
        const { cart, mealId } = action.payload;
        if (state.latestSetItemRequestId[mealId] !== action.meta.requestId) {
          return;
        }
        state.setItemStatus[mealId] = "succeeded";
        delete state.optimisticSnapshots[mealId];
        delete state.latestSetItemRequestId[mealId];
        rehydrateFromApi(state, cart);
      })
      .addCase(setCartItem.rejected, (state, action) => {
        const mealId = action.meta.arg.mealId;
        if (state.latestSetItemRequestId[mealId] !== action.meta.requestId) {
          return;
        }
        state.setItemStatus[mealId] = "failed";
        state.error = (action.payload as string) || "Failed to update cart";
        const snapshot = state.optimisticSnapshots[mealId];
        delete state.optimisticSnapshots[mealId];
        delete state.latestSetItemRequestId[mealId];
        if (snapshot) rehydrateFromApi(state, snapshot);
      });

    // --- Remove item
    builder
      .addCase(removeCartItem.pending, (state, action) => {
        const mealId = action.meta.arg;
        state.removeItemStatus[mealId] = "loading";
        state.error = null;
        state.optimisticSnapshots[mealId] = snapshotCart(state);
        state.latestRemoveItemRequestId[mealId] = action.meta.requestId;
        delete state.latestSetItemRequestId[mealId];
        applyOptimisticSetItem(state, { mealId, quantity: 0 });
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const { cart, mealId } = action.payload;
        if (state.latestRemoveItemRequestId[mealId] !== action.meta.requestId) {
          return;
        }
        state.removeItemStatus[mealId] = "succeeded";
        delete state.optimisticSnapshots[mealId];
        delete state.latestRemoveItemRequestId[mealId];
        rehydrateFromApi(state, cart);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const mealId = action.meta.arg;
        if (state.latestRemoveItemRequestId[mealId] !== action.meta.requestId) {
          return;
        }
        state.removeItemStatus[mealId] = "failed";
        state.error = (action.payload as string) || "Failed to remove item";
        const snapshot = state.optimisticSnapshots[mealId];
        delete state.optimisticSnapshots[mealId];
        delete state.latestRemoveItemRequestId[mealId];
        if (snapshot) rehydrateFromApi(state, snapshot);
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
