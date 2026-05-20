import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { CreateRiderPayload } from "./rider.type";

export const createRider = createAsyncThunk<
  { message: string; riderId: string },
  CreateRiderPayload,
  { rejectValue: string }
>("rider/createRider", async (body, { rejectWithValue }) => {
  try {
    const [firstName, ...rest] = body.full_name.trim().split(/\s+/);
    const { data } = await api.post<{ id: string }>("/logistics/riders", {
      first_name: firstName,
      last_name: rest.join(" ") || firstName,
      email: body.email,
      phone_number: body.phone_number,
    });
    return { message: "Rider created", riderId: data.id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create rider"));
  }
});
