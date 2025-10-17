import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type { RegisterPushTokenPayload } from "./notifications.types";

export const registerPushToken = createAsyncThunk<
  { message: string; token: string },
  RegisterPushTokenPayload,
  { rejectValue: string }
>("notifications/registerPushToken", async ({ token }, { rejectWithValue }) => {
  try {
    const res = await api.post("/notifications/push-token", { token });
    const message = res.data?.message ?? "Push token registered!";
    return { message, token };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to register push token"
    );
  }
});
