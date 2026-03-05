import { createSlice } from "@reduxjs/toolkit";
import type { ReferralsState } from "./referrals.types";
import { fetchReferrals } from "./referrals.thunks";

const initialState: ReferralsState = {
  items: [],
  meta: null,
  status: "idle",
  error: null,
};

const referralsSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {
    clearReferralsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferrals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items ?? [];
        state.meta = action.payload.meta ?? null;
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch referrals";
      });
  },
});

export const { clearReferralsState } = referralsSlice.actions;
export default referralsSlice.reducer;
