// cart.selectors.ts
import type { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";
import type { CartMeal, KitchenId, MealId } from "./cart.types";

export const selectCartState = (s: RootState) => s.cart;

export const selectCartKitchenIds = (s: RootState) => s.cart.kitchenIds;

export const selectCartGroupByKitchen = (kitchenId: KitchenId) =>
  createSelector([selectCartState], (cart) => cart.byKitchenId[kitchenId] ?? null);

const EMPTY_ITEMS: CartMeal[] = [];

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

export const selectCartSubtotalForKitchen = (kitchenId?: string | null) =>
  createSelector([(s: RootState) => (kitchenId ? s.cart.byKitchenId[kitchenId] : null)], (group) => {
    if (!group) return 0;
    return group.itemOrder.reduce((sum, id) => {
      const item = group.items[id];
      if (!item) return sum;
      const price = Number(item.meal.price);
      return sum + (isNaN(price) ? 0 : price) * (item.quantity ?? 0);
    }, 0);
  });

export const selectCartTotalItemsForKitchen = (kitchenId?: string | null) =>
  createSelector([(s: RootState) => (kitchenId ? s.cart.byKitchenId[kitchenId] : null)], (group) => {
    if (!group) return 0;
    return group.itemOrder.reduce((total, id) => total + (group.items[id]?.quantity ?? 0), 0);
  });

export const selectCartSubtotalForKitchens = (kitchenIds: string[]) =>
  createSelector([(s: RootState) => s.cart.byKitchenId], (byKitchenId) =>
    kitchenIds.reduce((sum, kid) => {
      const group = byKitchenId[kid];
      if (!group) return sum;
      return (
        sum +
        group.itemOrder.reduce((groupSum, id) => {
          const item = group.items[id];
          if (!item) return groupSum;
          const price = Number(item.meal.price);
          return groupSum + (isNaN(price) ? 0 : price) * (item.quantity ?? 0);
        }, 0)
      );
    }, 0)
  );

export const selectCartTotalItemsForKitchens = (kitchenIds: string[]) =>
  createSelector([(s: RootState) => s.cart.byKitchenId], (byKitchenId) =>
    kitchenIds.reduce((total, kid) => {
      const group = byKitchenId[kid];
      if (!group) return total;
      return (
        total +
        group.itemOrder.reduce(
          (groupTotal, id) => groupTotal + (group.items[id]?.quantity ?? 0),
          0
        )
      );
    }, 0)
  );

export type CartOrderRow = {
  id: string;
  mealId: string;
  kitchenId: string;
  kitchenName: string;
  title: string;
  qty: number;
  price: number;
  cover: string | null;
};

const EMPTY_ORDER_ROWS: CartOrderRow[] = [];

const buildOrderRows = (
  kitchenId: string,
  group: RootState["cart"]["byKitchenId"][string]
): CartOrderRow[] =>
  group.itemOrder
    .map((id) => {
      const item = group.items[id];
      if (!item) return null;
      return {
        id: `${kitchenId}:${item.meal.id}`,
        mealId: String(item.meal.id),
        kitchenId,
        kitchenName: group.kitchen.name ?? "Kitchen",
        title: item.meal.name,
        qty: item.quantity,
        price: Number(item.meal.price),
        cover: item.meal.cover_image?.url ?? null,
      };
    })
    .filter((row): row is CartOrderRow => Boolean(row));

export const selectOrderRowsForKitchen = (kitchenId?: string | null) =>
  createSelector(
    [
      (state: RootState) =>
        kitchenId ? state.cart.byKitchenId[kitchenId] : null,
    ],
    (group) => {
      if (!group) return EMPTY_ORDER_ROWS;
      return buildOrderRows(kitchenId!, group);
    }
  );

export const selectOrderRowsForKitchens = (kitchenIds: string[]) =>
  createSelector([(state: RootState) => state.cart.byKitchenId], (byKitchenId) =>
    kitchenIds.flatMap((kitchenId) => {
      const group = byKitchenId[kitchenId];
      if (!group) return EMPTY_ORDER_ROWS;
      return buildOrderRows(kitchenId, group);
    })
  );
