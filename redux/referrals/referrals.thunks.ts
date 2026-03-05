import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import type { Referral } from "./referrals.types";

type FetchReferralsResponse = {
  items: Referral[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

export const fetchReferrals = createAsyncThunk<
  FetchReferralsResponse,
  void,
  { rejectValue: string }
>("referrals/fetchReferrals", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<FetchReferralsResponse>("/referrals");
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch referrals"));
  }
});
