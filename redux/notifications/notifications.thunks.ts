import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import type { AppNotification, RegisterPushTokenPayload } from "./notifications.types";

export const registerPushToken = createAsyncThunk<
  { message: string; token: string },
  RegisterPushTokenPayload,
  { rejectValue: string }
>("notifications/registerPushToken", async ({ token }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<{ message?: string }>("/notifications/push-token", {
      token,
    });
    const message = data.message || "Push token registered";
    return { message, token };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to register push token"));
  }
});

export const fetchNotifications = createAsyncThunk<
  AppNotification[],
  void,
  { rejectValue: string }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ data: AppNotification[] }>("/notifications");
    return data.data ?? [];
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch notifications"));
  }
});

export const markNotificationRead = createAsyncThunk<
  AppNotification,
  string,
  { rejectValue: string }
>("notifications/markNotificationRead", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<AppNotification>(`/notifications/${id}/read`);
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to mark notification read"));
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("notifications/markAllNotificationsRead", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<{ message?: string }>("/notifications/read-all");
    return { message: data.message || "Notifications marked as read" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to mark notifications read"));
  }
});
