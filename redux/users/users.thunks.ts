import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { getMediaUrl, uploadSingleMedia } from "@/api/storage";
import type { UpdateUserPayload, User } from "./users.types";
import { setUser as setAuthUser } from "@/redux/auth/auth.slice";
import type { RootState } from "@/store";
import { clearRefreshToken, clearToken, clearUser } from "@/storage/auth";

type BackendMediaDescription = {
  id: string;
  url?: string | null;
  meta?: Record<string, string | null | undefined> | null;
};

type BackendProfileUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  role: string;
  has_kitchen: boolean;
  profile_picture_id: string | null;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
  referral?: {
    code?: string;
    url?: string;
  } | null;
  profile_picture?: BackendMediaDescription | null;
};

type GetProfileResponse = {
  data?: BackendProfileUser;
  _tag: "GetProfileResponse";
} & Partial<BackendProfileUser>;

type BackendUserById = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  role: string;
  has_kitchen: boolean;
  profile_picture_id: string | null;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};

const toUser = (data: BackendProfileUser | BackendUserById): User => {
  const media = "profile_picture" in data ? data.profile_picture : null;
  const profilePictureUrl = getMediaUrl(media, data.profile_picture_id);

  return {
    id: data.id,
    email: data.email,
    phone_number: data.phone_number,
    is_verified: data.is_verified,
    first_name: data.first_name,
    last_name: data.last_name,
    has_kitchen: data.has_kitchen ?? false,
    role: data.role,
    birthday: null,
    referral_code: "referral" in data ? data.referral?.code ?? null : null,
    referral_url: "referral" in data ? data.referral?.url ?? null : null,
    profile_picture_id: data.profile_picture_id,
    profile_picture: profilePictureUrl
      ? {
          id: data.profile_picture_id,
          url: profilePictureUrl,
        }
      : null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
};

export const fetchMyProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  "users/fetchMyProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.get<GetProfileResponse>("/users/profile");
      const profile = data.data ?? (data as BackendProfileUser);
      const user = toUser(profile);

      dispatch(
        setAuthUser({
          id: user.id,
          email: user.email,
          phone_number: user.phone_number,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          has_kitchen: user.has_kitchen,
        })
      );

      return user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load profile"));
    }
  }
);

export const updateMyProfile = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>("users/updateMyProfile", async (body, { dispatch, rejectWithValue }) => {
  try {
    await api.patch("/users/profile", body);
    const refreshed = await dispatch(fetchMyProfile()).unwrap();
    return refreshed;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update profile"));
  }
});

export const uploadProfilePicture = createAsyncThunk<
  User,
  { uri: string; name?: string; type?: string },
  { rejectValue: string }
>("users/uploadProfilePicture", async ({ uri, name, type }, { dispatch, rejectWithValue }) => {
  try {
    const uploaded = await uploadSingleMedia({ uri, name, type });
    if (!uploaded?.id) {
      return rejectWithValue("Image upload failed");
    }

    await api.patch("/users/profile", {
      profile_picture_id: uploaded.id,
    });

    const refreshed = await dispatch(fetchMyProfile()).unwrap();
    return refreshed;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to upload picture"));
  }
});

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendUserById>(`/users/${id}`);
      return toUser(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load user"));
    }
  }
);

export const deleteMyProfile = createAsyncThunk<
  { message: string },
  void,
  { state: RootState; rejectValue: string }
>("users/deleteMyProfile", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/users/profile");
    await clearToken();
    await clearRefreshToken();
    await clearUser();
    return { message: "Account deleted" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to delete account"));
  }
});

export const fetchUsers = createAsyncThunk<
  { items: User[]; meta: { page: number; per_page: number; total: number } },
  { page?: number; per_page?: number; role?: string; search?: string } | undefined,
  { rejectValue: string }
>("users/fetchUsers", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{
      items: BackendUserById[];
      meta: { page: number; per_page: number; total: number };
    }>("/users", {
      params: query,
    });
    return {
      items: (data.items ?? []).map(toUser),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load users"));
  }
});
