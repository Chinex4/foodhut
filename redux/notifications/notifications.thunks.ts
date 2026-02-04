import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RegisterPushTokenPayload } from "./notifications.types";

export const registerPushToken = createAsyncThunk<
  { message: string; token: string },
  RegisterPushTokenPayload,
  { rejectValue: string }
>("notifications/registerPushToken", async ({ token }, { rejectWithValue }) => {
  try {
    const message = "Push token registered!";
    return { message, token };
  } catch (err: any) {
    return rejectWithValue("Failed to register push token");
  }
});
