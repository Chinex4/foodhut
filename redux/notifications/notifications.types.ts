export type NotificationsStatus = "idle" | "loading" | "succeeded" | "failed";

export type RegisterPushTokenPayload = {
  token: string;
};

export type AppNotification = {
  id: string;
  user_id: string;
  type: "NEW_DELIVERY_AVAILABLE" | "OFFER_STATUS_CHANGED" | "DELIVERY_STATUS_CHANGED" | string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  read: boolean;
  created_at: number | string;
  updated_at: number | string | null;
};

export type NotificationsState = {
  items: Record<string, AppNotification>;
  order: string[];
  listStatus: NotificationsStatus;
  lastRegisteredToken: string | null;
  registerStatus: NotificationsStatus;
  markStatus: NotificationsStatus;
  error: string | null;
};
