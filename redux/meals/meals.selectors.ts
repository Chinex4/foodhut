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

// simple deterministic hash
const hashString = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h >>> 0; // unsigned
};

// turn hash into [0, 1)
const jitterFor = (id: string, salt: string) => {
  const h = hashString(id + salt);
  return (h % 1000) / 1000; // 0..0.999
};

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

    // fallback – popular (same as before)
    return arr
      .slice()
      .sort(
        (a, b) =>
          toNum(b.rating) - toNum(a.rating) || toNum(b.likes) - toNum(a.likes)
      )
      .slice(0, limit);
  });

export const makeSelectMostPopular = (limit = 10, salt = "day-1") => {
  const selectTrending = makeSelectTrendingDiscounts(limit);

  return createSelector([selectMealsArray, selectTrending], (arr, trending) => {
    const excludeIds = new Set(trending.map((m) => m.id));
    const candidates = arr.filter((m) => !excludeIds.has(m.id));
    if (!candidates.length) return trending;

    const scored = candidates.map((m) => {
      const baseScore = toNum(m.rating) * 3 + toNum(m.likes); // your main metric
      const jitter = jitterFor(m.id, salt) * 0.2; // small 0–0.2 bonus
      return { m, score: baseScore + jitter };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.m);
  });
};

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
