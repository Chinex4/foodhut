import type { RootState } from "@/store";
import type { KitchenId, MealId } from "./cart.types";

export const selectCartState = (s: RootState) => s.cart;

export const selectCartKitchenIds = (s: RootState) => s.cart.kitchenIds;

export const selectCartGroupByKitchen =
  (kitchenId: KitchenId) => (s: RootState) =>
    s.cart.byKitchenId[kitchenId] ?? null;

export const selectCartItemsForKitchen =
  (kitchenId: KitchenId) => (s: RootState) => {
    const g = s.cart.byKitchenId[kitchenId];
    if (!g) return [];
    return g.itemOrder.map((id) => g.items[id]).filter(Boolean);
  };

export const selectCartItemQuantity =
  (kitchenId: KitchenId, mealId: MealId) => (s: RootState) =>
    s.cart.byKitchenId[kitchenId]?.items[mealId]?.quantity ?? 0;

export const selectCartFetchStatus = (s: RootState) => s.cart.fetchStatus;
export const selectCartCheckoutStatus = (s: RootState) => s.cart.checkoutStatus;
export const selectCartError = (s: RootState) => s.cart.error;

export const makeSelectSetItemStatus = (mealId: MealId) => (s: RootState) =>
  s.cart.setItemStatus[mealId] ?? "idle";

export const makeSelectRemoveItemStatus = (mealId: MealId) => (s: RootState) =>
  s.cart.removeItemStatus[mealId] ?? "idle";

export const makeSelectClearKitchenStatus =
  (kitchenId: KitchenId) => (s: RootState) =>
    s.cart.clearKitchenStatus[kitchenId] ?? "idle";

export const selectCartTotalItems = (s: RootState) => {
  let total = 0;
  for (const kid of s.cart.kitchenIds) {
    const g = s.cart.byKitchenId[kid];
    if (!g) continue;
    for (const id of g.itemOrder) total += g.items[id]?.quantity ?? 0;
  }
  return total;
};

export const selectCartSubtotal = (s: RootState) => {
  let sum = 0;
  for (const kid of s.cart.kitchenIds) {
    const g = s.cart.byKitchenId[kid];
    if (!g) continue;
    for (const id of g.itemOrder) {
      const item = g.items[id];
      if (!item) continue;
      const price = Number(item.meal.price);
      sum += (isNaN(price) ? 0 : price) * (item.quantity ?? 0);
    }
  }
  return sum;
};
