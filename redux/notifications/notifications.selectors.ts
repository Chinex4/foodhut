import type { RootState } from "@/store";

export const selectNotificationsState = (s: RootState) => s.notifications;

export const selectPushToken = (s: RootState) => s.notifications.lastRegisteredToken;
export const selectPushRegisterStatus = (s: RootState) => s.notifications.registerStatus;
export const selectNotificationsError = (s: RootState) => s.notifications.error;
