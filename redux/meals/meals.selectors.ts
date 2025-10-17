import type { RootState } from "@/store";
import type { MealId, Meal } from "./meals.types";
import { toNum } from "@/utils/money";
import { createSelector } from "@reduxjs/toolkit";

export const selectMealsEntities = (s: RootState) => s.meals.entities;
export const selectMealsIds = (s: RootState) => s.meals.lastListIds;

export const selectMealsArray = createSelector(
  [selectMealsEntities],
  (entities): Meal[] => Object.values(entities ?? {})
);

// === FACTORY SELECTORS (memoized) ===
export const makeSelectTrendingDiscounts = (limit = 10) =>
  createSelector([selectMealsArray], (arr) => {
    const discounted = arr
      .map((m) => {
        const price = toNum(m.price);
        const original = toNum(m.original_price);
        const discount =
          original > price ? (original - price) / (original || 1) : 0;
        return { m, discount };
      })
      .filter((x) => x.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, limit)
      .map((x) => x.m);

    if (discounted.length) return discounted;
    // fallback – popular
    return arr
      .slice()
      .sort(
        (a, b) =>
          toNum(b.rating) - toNum(a.rating) || toNum(b.likes) - toNum(a.likes)
      )
      .slice(0, limit);
  });

export const makeSelectMostPopular = (limit = 10) =>
  createSelector([selectMealsArray], (arr) =>
    arr
      .slice()
      .sort(
        (a, b) =>
          toNum(b.rating) - toNum(a.rating) || toNum(b.likes) - toNum(a.likes)
      )
      .slice(0, limit)
  );

export const makeSelectVendorsCloseBy = (limitKitchens = 10) =>
  createSelector([selectMealsArray], (arr) => {
    const byKitchen = new Map<string, Meal[]>();
    for (const m of arr) {
      if (!m.kitchen_id) continue;
      const list = byKitchen.get(m.kitchen_id) ?? [];
      list.push(m);
      byKitchen.set(m.kitchen_id, list);
    }
    const reps = Array.from(byKitchen.values()).map(
      (list) =>
        list
          .slice()
          .sort((a, b) => {
            const tb =
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime();
            if (tb !== 0) return tb;
            return toNum(b.rating) - toNum(a.rating);
          })
          .at(0)!
    );
    return reps.slice(0, limitKitchens);
  });

export const selectMealsState = (s: RootState) => s.meals;

export const selectMealsList = (s: RootState) =>
  s.meals.lastListIds.map((id) => s.meals.entities[id]).filter(Boolean);

export const selectMealsMeta = (s: RootState) => s.meals.lastListMeta;
export const selectMealsQuery = (s: RootState) => s.meals.lastListQuery;

export const selectMealById = (id: MealId) => (s: RootState) =>
  s.meals.entities[id] ?? null;

// statuses
export const selectMealsError = (s: RootState) => s.meals.error;
export const selectMealsListStatus = (s: RootState) => s.meals.listStatus;
export const selectMealCreateStatus = (s: RootState) => s.meals.createStatus;

export const makeSelectMealByIdStatus = (id: MealId) => (s: RootState) =>
  s.meals.byIdStatus[id] ?? "idle";

export const makeSelectMealUpdateStatus = (id: MealId) => (s: RootState) =>
  s.meals.updateByIdStatus[id] ?? "idle";

export const makeSelectMealDeleteStatus = (id: MealId) => (s: RootState) =>
  s.meals.deleteByIdStatus[id] ?? "idle";

export const makeSelectMealLikeStatus = (id: MealId) => (s: RootState) =>
  s.meals.likeStatus[id] ?? "idle";
