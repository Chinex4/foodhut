export type UserId = string;

export type UserRole = "USER" | "ADMIN" | string;

export type User = {
  id: UserId;
  email: string;
  phone_number: string;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  has_kitchen?: boolean;
  has_rider?: boolean;
  role?: UserRole;
  birthday?: string | null;
  referral_code?: string | null;
  profile_picture_id?: string | null;
  profile_picture: {
    id?: string | null;
    url: string;
  } | null;
  created_at: number | string;
  updated_at: number | string | null;
  deleted_at?: number | string | null;
};

export type UpdateUserPayload = {
  first_name?: string;
  last_name?: string;
  profile_picture_id?: string;
};

export type UsersStatus = "idle" | "loading" | "succeeded" | "failed";

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
