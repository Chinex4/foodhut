import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type { UpdateUserPayload, User } from "./users.types";
import type { RootState } from "@/store";
import { setUser as setAuthUser } from "@/redux/auth/auth.slice";

const BASE = "/users";

export const fetchMyProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("users/fetchMyProfile", async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/profile`);
    const user: User = res.data;
    dispatch(
      setAuthUser({
        email: user.email,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
      })
    );
    return user;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to load profile"
    );
  }
});

export const updateMyProfile = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>(
  "users/updateMyProfile",
  async (body, { dispatch, getState, rejectWithValue }) => {
    try {
      await api.patch(`${BASE}/profile`, body);
      const res = await api.get(`${BASE}/profile`);
      const user: User = res.data;

      dispatch(
        setAuthUser({
          email: user.email,
          phone_number: user.phone_number,
          first_name: user.first_name,
          last_name: user.last_name,
        })
      );
      return user;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const uploadProfilePicture = createAsyncThunk<
  User,
  { uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "users/uploadProfilePicture",
  async ({ uri, name, type }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("profile_picture" as any, {
        uri,
        name: name ?? "avatar.jpg",
        type: type ?? "image/jpeg",
      });

      const resMsg = await api.put(`${BASE}/profile/profile-picture`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await api.get(`${BASE}/profile`);
      return res.data as User;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to upload picture"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/fetchUserById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as User;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to load user"
    );
  }
});

export const deleteMyProfile = createAsyncThunk<
  { message: string },
  void,
  { state: RootState; rejectValue: string }
>("users/deleteMyProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete(`${BASE}/profile`);
    return { message: res.data?.message ?? "Account deleted" };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to delete account"
    );
  }
});
