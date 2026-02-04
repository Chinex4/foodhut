import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateRiderPayload } from "./rider.type";

export const createRider = createAsyncThunk<
  { message: string },
  CreateRiderPayload,
  { rejectValue: string }
>("rider/createRider", async (body, { rejectWithValue }) => {
  try {
    return { message: "Rider created!" };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to create rider"
    );
  }
});
