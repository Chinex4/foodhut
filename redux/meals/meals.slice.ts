import { createSlice } from "@reduxjs/toolkit";
import type { Meal, MealsState } from "./meals.types";
import {
  createMeal,
  deleteMealById,
  fetchMealById,
  fetchMeals,
  likeMeal,
  unlikeMeal,
  updateMealById,
} from "./meals.thunks";

const initialState: MealsState = {
  entities: {},

  lastListIds: [],
  lastListMeta: null,
  lastListQuery: null,

  listStatus: "idle",
  createStatus: "idle",
  byIdStatus: {},
  updateByIdStatus: {},
  deleteByIdStatus: {},
  likeStatus: {},

  error: null,
};

const upsert = (state: MealsState, m: Meal) => {
  state.entities[m.id] = m;
};

const mealsSlice = createSlice({
  name: "meals",
  initialState,
  reducers: {
    clearMealsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // --- CREATE
    builder
      .addCase(createMeal.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createMeal.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createMeal.rejected, (state, a) => {
        state.createStatus = "failed";
        state.error = (a.payload as string) || "Failed to create meal";
      });

    // --- LIST
    builder
      .addCase(fetchMeals.pending, (state, a) => {
        state.listStatus = "loading";
        state.error = null;
        state.lastListQuery = a.meta.arg ?? null;
      })
      .addCase(fetchMeals.fulfilled, (state, a) => {
        state.listStatus = "succeeded";
        const { items, meta } = a.payload;
        state.lastListIds = items.map((m) => m.id);
        state.lastListMeta = meta;
        items.forEach((m) => upsert(state, m));
      })
      .addCase(fetchMeals.rejected, (state, a) => {
        state.listStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch meals";
      });

    // --- BY ID
    builder
      .addCase(fetchMealById.pending, (state, a) => {
        state.byIdStatus[a.meta.arg] = "loading";
      })
      .addCase(fetchMealById.fulfilled, (state, a) => {
        state.byIdStatus[a.payload.id] = "succeeded";
        upsert(state, a.payload);
      })
      .addCase(fetchMealById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to fetch meal";
      });

    // --- UPDATE
    builder
      .addCase(updateMealById.pending, (state, a) => {
        state.updateByIdStatus[a.meta.arg.id] = "loading";
      })
      .addCase(updateMealById.fulfilled, (state, a) => {
        const { id, meal } = a.payload;
        state.updateByIdStatus[id] = "succeeded";
        if (meal) upsert(state, meal);
      })
      .addCase(updateMealById.rejected, (state, a) => {
        const id = a.meta.arg.id;
        state.updateByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to update meal";
      });

    // --- LIKE / UNLIKE
    builder
      .addCase(likeMeal.pending, (state, a) => {
        state.likeStatus[a.meta.arg] = "loading";
      })
      .addCase(likeMeal.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.likeStatus[id] = "succeeded";
        const m = state.entities[id];
        if (m) {
          m.likes = (m.likes ?? 0) + 1;
          m.is_liked = true; // <<< set flag
        }
      })
      .addCase(likeMeal.rejected, (state, a) => {
        const id = a.meta.arg;
        state.likeStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to like meal";
      });

    builder
      .addCase(unlikeMeal.pending, (state, a) => {
        state.likeStatus[a.meta.arg] = "loading";
      })
      .addCase(unlikeMeal.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.likeStatus[id] = "succeeded";
        const m = state.entities[id];
        if (m) {
          m.likes = Math.max(0, (m.likes ?? 0) - 1);
          m.is_liked = false; // <<< clear flag
        }
      })
      .addCase(unlikeMeal.rejected, (state, a) => {
        const id = a.meta.arg;
        state.likeStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to unlike meal";
      });

    // --- DELETE
    builder
      .addCase(deleteMealById.pending, (state, a) => {
        state.deleteByIdStatus[a.meta.arg] = "loading";
      })
      .addCase(deleteMealById.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.deleteByIdStatus[id] = "succeeded";
        delete state.entities[id];
        // also drop from last list cache
        state.lastListIds = state.lastListIds.filter((x) => x !== id);
        if (state.lastListMeta) {
          state.lastListMeta = {
            ...state.lastListMeta,
            total: Math.max(0, state.lastListMeta.total - 1),
          };
        }
      })
      .addCase(deleteMealById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.deleteByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to delete meal";
      });
  },
});

export const { clearMealsState } = mealsSlice.actions;
export default mealsSlice.reducer;
