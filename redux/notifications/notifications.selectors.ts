import type { RootState } from "@/store";

export const selectNotificationsState = (s: RootState) => s.notifications;

export const selectNotificationsList = (s: RootState) =>
  s.notifications.order.map((id) => s.notifications.items[id]).filter(Boolean);
export const selectUnreadNotificationsCount = (s: RootState) =>
  s.notifications.order.reduce(
    (count, id) => count + (s.notifications.items[id]?.read ? 0 : 1),
    0
  );
export const selectNotificationsListStatus = (s: RootState) =>
  s.notifications.listStatus;
export const selectNotificationMarkStatus = (s: RootState) =>
  s.notifications.markStatus;
export const selectPushToken = (s: RootState) => s.notifications.lastRegisteredToken;
export const selectPushRegisterStatus = (s: RootState) => s.notifications.registerStatus;
export const selectNotificationsError = (s: RootState) => s.notifications.error;
