export type NotificationsStatus = "idle" | "loading" | "succeeded" | "failed";

export type RegisterPushTokenPayload = {
  token: string;
};

export type NotificationsState = {
  lastRegisteredToken: string | null;
  registerStatus: NotificationsStatus;
  error: string | null;
};
