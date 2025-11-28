// cart.selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { KitchenId, MealId } from "./cart.types";

export const selectCartState = (s: RootState) => s.cart;

export const selectCartKitchenIds = (s: RootState) => s.cart.kitchenIds;

export const selectCartGroupByKitchen = (kitchenId: KitchenId) =>
  createSelector([selectCartState], (cart) => cart.byKitchenId[kitchenId] ?? null);

const EMPTY_ITEMS: any[] = []; // or a proper CartItem[] type

export const selectCartItemsForKitchen = (kitchenId: KitchenId) =>
  createSelector([selectCartGroupByKitchen(kitchenId)], (g) => {
    if (!g) return EMPTY_ITEMS;
    return g.itemOrder.map((id) => g.items[id]).filter(Boolean);
  });

export const selectCartItemQuantity =
  (kitchenId: KitchenId, mealId: MealId) =>
  (s: RootState) =>
    s.cart.byKitchenId[kitchenId]?.items[mealId]?.quantity ?? 0;

export const selectCartFetchStatus = (s: RootState) => s.cart.fetchStatus;
export const selectCartCheckoutStatus = (s: RootState) =>
  s.cart.checkoutStatus;
export const selectCartError = (s: RootState) => s.cart.error;

export const makeSelectSetItemStatus = (mealId: MealId) => (s: RootState) =>
  s.cart.setItemStatus[mealId] ?? "idle";

export const makeSelectRemoveItemStatus =
  (mealId: MealId) => (s: RootState) =>
    s.cart.removeItemStatus[mealId] ?? "idle";

export const makeSelectClearKitchenStatus =
  (kitchenId: KitchenId) => (s: RootState) =>
    s.cart.clearKitchenStatus[kitchenId] ?? "idle";

export const selectCartTotalItems = createSelector(
  [selectCartState],
  (cart) => {
    let total = 0;
    for (const kid of cart.kitchenIds) {
      const g = cart.byKitchenId[kid];
      if (!g) continue;
      for (const id of g.itemOrder) total += g.items[id]?.quantity ?? 0;
    }
    return total;
  }
);

export const selectCartSubtotal = createSelector(
  [selectCartState],
  (cart) => {
    let sum = 0;
    for (const kid of cart.kitchenIds) {
      const g = cart.byKitchenId[kid];
      if (!g) continue;
      for (const id of g.itemOrder) {
        const item = g.items[id];
        if (!item) continue;
        const price = Number(item.meal.price);
        sum += (isNaN(price) ? 0 : price) * (item.quantity ?? 0);
      }
    }
    return sum;
  }
);

const EMPTY_ORDER_ROWS: any[] = [];

export const selectOrderRowsForKitchen = (kitchenId?: string | null) =>
  createSelector(
    [
      (state: RootState) =>
        kitchenId ? state.cart.byKitchenId[kitchenId] : null,
    ],
    (group) => {
      if (!group) return EMPTY_ORDER_ROWS;
      return group.itemOrder.map((id) => group.items[id]).filter(Boolean);
    }
  );
