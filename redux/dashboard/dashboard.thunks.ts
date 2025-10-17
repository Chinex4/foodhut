import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  AnalyticsResponse,
  AnalyticsType,
  DashboardInfo,
} from "./dashboard.types";

export const fetchDashboardInfo = createAsyncThunk<
  DashboardInfo,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboardInfo", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/dashboard/info");
    return res.data as DashboardInfo;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch dashboard info"
    );
  }
});

export const fetchDashboardAnalytics = createAsyncThunk<
  {
    items: AnalyticsResponse["data"]["items"];
    meta: AnalyticsResponse["data"]["meta"];
    total: string;
    type: AnalyticsType;
  },
  { type: AnalyticsType },
  { rejectValue: string }
>(
  "dashboard/fetchDashboardAnalytics",
  async ({ type }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/dashboard/analytics`, { params: { type } });
      const data = res.data as AnalyticsResponse;
      return {
        items: data.data.items,
        meta: data.data.meta,
        total: data.total,
        type,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Failed to fetch analytics"
      );
    }
  }
);
