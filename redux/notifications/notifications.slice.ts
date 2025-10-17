import { createSlice } from "@reduxjs/toolkit";
import type { NotificationsState } from "./notifications.types";
import { registerPushToken } from "./notifications.thunks";

const initialState: NotificationsState = {
  lastRegisteredToken: null,
  registerStatus: "idle",
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPushToken.pending, (state) => {
        state.registerStatus = "loading";
        state.error = null;
      })
      .addCase(registerPushToken.fulfilled, (state, action) => {
        state.registerStatus = "succeeded";
        state.lastRegisteredToken = action.payload.token;
      })
      .addCase(registerPushToken.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.error =
          (action.payload as string) || "Failed to register push token";
      });
  },
});

export const { clearNotificationsState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
