import { createSlice } from "@reduxjs/toolkit";
import type { AppNotification, NotificationsState } from "./notifications.types";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
} from "./notifications.thunks";

const initialState: NotificationsState = {
  items: {},
  order: [],
  listStatus: "idle",
  lastRegisteredToken: null,
  registerStatus: "idle",
  markStatus: "idle",
  error: null,
};

const upsertNotifications = (state: NotificationsState, items: AppNotification[]) => {
  for (const item of items) state.items[item.id] = item;
  state.order = items.map((item) => item.id);
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
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        upsertNotifications(state, action.payload);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch notifications";
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.markStatus = "loading";
        state.error = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markStatus = "succeeded";
        state.items[action.payload.id] = action.payload;
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.markStatus = "failed";
        state.error = (action.payload as string) || "Failed to mark notification read";
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markStatus = "loading";
        state.error = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markStatus = "succeeded";
        for (const id of state.order) {
          if (state.items[id]) state.items[id].read = true;
        }
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.markStatus = "failed";
        state.error = (action.payload as string) || "Failed to mark notifications read";
      });
  },
});

export const { clearNotificationsState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
