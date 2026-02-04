import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  AnalyticsResponse,
  AnalyticsType,
  DashboardInfo,
} from "./dashboard.types";
import { mockAnalyticsItems, mockDashboardInfo } from "@/utils/mockData";

export const fetchDashboardInfo = createAsyncThunk<
  DashboardInfo,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboardInfo", async (_, { rejectWithValue }) => {
  try {
    return mockDashboardInfo;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch dashboard info");
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
      const perPage = 10;
      return {
        items: mockAnalyticsItems,
        meta: {
          page: 1,
          per_page: perPage,
          total: mockAnalyticsItems.length,
        },
        total: String(
          mockAnalyticsItems.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          )
        ),
        type,
      };
    } catch (err: any) {
      return rejectWithValue("Failed to fetch analytics");
    }
  }
);
