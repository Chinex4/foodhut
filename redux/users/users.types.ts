export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  phone_number: string;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  has_kitchen?: boolean;
  birthday: string | null;
  referral_code: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export type UpdateUserPayload = {
  first_name?: string;
  last_name?: string;
};

export type UsersStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

export type UsersState = {
  entities: Record<UserId, User>;
  currentId: UserId | null;
  fetchMeStatus: UsersStatus;
  updateMeStatus: UsersStatus;
  uploadPicStatus: UsersStatus;
  deleteMeStatus: UsersStatus;
  byIdStatus: Record<UserId, UsersStatus>;
  error: string | null;
};
