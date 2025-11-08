import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateRiderPayload } from "./rider.type";
import { api } from "@/api/axios";

const BASE = "/riders";

export const createRider = createAsyncThunk<
  { message: string },
  CreateRiderPayload,
  { rejectValue: string }
>("rider/createRider", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}`, body);
    const message = res.data?.message ?? res.data?.data ?? "Rider created!";
    return { message };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to create rider"
    );
  }
});
