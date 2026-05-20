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

export const selectMealsList = createSelector(
  [selectMealsIds, selectMealsEntities],
  (ids, entities): Meal[] => {
    const seen = new Set<string>();
    return ids
      .filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((id) => entities[id])
      .filter(Boolean);
  }
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

const rotateRandomly = (arr: Meal[], salt: string) =>
  arr
    .slice()
    .sort((a, b) => jitterFor(b.id, salt) - jitterFor(a.id, salt));

const hasMealDiscount = (m: Meal) => {
  const price = toNum(m.price);
  const original = toNum(m.original_price);
  if (original > price) return true;
  if (!m.discount) return false;
  if ("percentage" in m.discount) return Number(m.discount.percentage) > 0;
  if ("price" in m.discount) return Number(m.discount.price) > 0;
  return false;
};

// === FACTORY SELECTORS (memoized) ===
export const makeSelectTrendingDiscounts = (limit = 10) =>
  createSelector([selectMealsList], (arr) => {
    const discounted = rotateRandomly(arr.filter(hasMealDiscount), "trending-discounts");

    if (discounted.length) return discounted.slice(0, limit);

    return rotateRandomly(arr, "trending-fallback").slice(0, limit);
  });

export const makeSelectMostPopular = (limit = 10, salt = "day-1") => {
  const selectTrending = makeSelectTrendingDiscounts(limit);

  return createSelector([selectMealsList, selectTrending], (arr, trending) => {
    const excludeIds = new Set(trending.map((m) => m.id));
    const candidates = arr.filter((m) => !excludeIds.has(m.id));
    const source = candidates.length ? candidates : arr;

    return rotateRandomly(source, `popular-${salt}`).slice(0, limit);
  });
};

export const makeSelectVendorsCloseBy = (limitKitchens = 10) =>
  createSelector([selectMealsList], (arr) => {
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

export const makeSelectMealsByKitchenId = (kitchenId: string) =>
  createSelector([selectMealsArray], (meals) => {
    const seen = new Set<string>();
    return meals
      .filter((meal) => meal.kitchen_id === kitchenId)
      .filter((meal) => {
        if (seen.has(meal.id)) return false;
        seen.add(meal.id);
        return true;
      });
  });

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
