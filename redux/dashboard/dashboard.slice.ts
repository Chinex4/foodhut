import { createSlice } from "@reduxjs/toolkit";
import type { DashboardState } from "./dashboard.types";
import { fetchDashboardAnalytics, fetchDashboardInfo } from "./dashboard.thunks";

const initialState: DashboardState = {
  info: null,
  infoStatus: "idle",

  analytics: [],
  analyticsMeta: null,
  analyticsTotal: null,
  analyticsType: null,
  analyticsStatus: "idle",

  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // INFO
    builder
      .addCase(fetchDashboardInfo.pending, (state) => {
        state.infoStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardInfo.fulfilled, (state, action) => {
        state.infoStatus = "succeeded";
        state.info = action.payload;
      })
      .addCase(fetchDashboardInfo.rejected, (state, action) => {
        state.infoStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch dashboard info";
      });

    // ANALYTICS
    builder
      .addCase(fetchDashboardAnalytics.pending, (state, action) => {
        state.analyticsStatus = "loading";
        state.error = null;
        state.analyticsType = action.meta.arg.type;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = "succeeded";
        state.analytics = action.payload.items;
        state.analyticsMeta = action.payload.meta;
        state.analyticsTotal = action.payload.total;
        state.analyticsType = action.payload.type;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.analyticsStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch analytics";
      });
  },
});

export const { clearDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
