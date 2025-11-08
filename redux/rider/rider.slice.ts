import { createSlice } from "@reduxjs/toolkit";
import { RiderState } from "./rider.type";
import { createRider } from "./rider.thunk";

const initialState: RiderState = { status: "idle", error: null };

const riderSlice = createSlice({
  name: "rider",
  initialState,
  reducers: {
    resetRiderState: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(createRider.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(createRider.fulfilled, (s) => {
      s.status = "succeeded";
    });
    b.addCase(createRider.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload || "Failed to create rider";
    });
  },
});

export const { resetRiderState } = riderSlice.actions;
export default riderSlice.reducer;
