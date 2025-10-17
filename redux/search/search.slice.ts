import { createSlice } from "@reduxjs/toolkit";
import type { SearchState } from "./search.types";
import { searchMealsAndKitchens } from "./search.thunks";

const initialState: SearchState = {
  items: [],
  meta: null,
  query: null,
  status: "idle",
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearchState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMealsAndKitchens.pending, (state, a) => {
        state.status = "loading";
        state.error = null;
        state.query = a.meta.arg;
      })
      .addCase(searchMealsAndKitchens.fulfilled, (state, a) => {
        state.status = "succeeded";
        state.items = a.payload.items;
        state.meta = a.payload.meta;
      })
      .addCase(searchMealsAndKitchens.rejected, (state, a) => {
        state.status = "failed";
        state.error = (a.payload as string) || "Failed to search";
      });
  },
});

export const { clearSearchState } = searchSlice.actions;
export default searchSlice.reducer;
