import type { RootState } from "@/store";

export const selectDashboardState = (s: RootState) => s.dashboard;

export const selectDashboardInfo = (s: RootState) => s.dashboard.info;
export const selectDashboardInfoStatus = (s: RootState) => s.dashboard.infoStatus;

export const selectAnalyticsItems = (s: RootState) => s.dashboard.analytics;
export const selectAnalyticsMeta = (s: RootState) => s.dashboard.analyticsMeta;
export const selectAnalyticsTotal = (s: RootState) => s.dashboard.analyticsTotal;
export const selectAnalyticsType = (s: RootState) => s.dashboard.analyticsType;
export const selectAnalyticsStatus = (s: RootState) => s.dashboard.analyticsStatus;

export const selectDashboardError = (s: RootState) => s.dashboard.error;
