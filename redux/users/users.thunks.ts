import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UpdateUserPayload, User } from "./users.types";
import type { RootState } from "@/store";
import { setUser as setAuthUser } from "@/redux/auth/auth.slice";
import { mockUser } from "@/utils/mockData";

let currentUser: User = { ...mockUser };

export const fetchMyProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("users/fetchMyProfile", async (_, { dispatch, rejectWithValue }) => {
  try {
    const user: User = currentUser;
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
    return rejectWithValue("Failed to load profile");
  }
});

export const updateMyProfile = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>(
  "users/updateMyProfile",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      currentUser = {
        ...currentUser,
        ...body,
        updated_at: new Date().toISOString(),
      };
      const user: User = currentUser;

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
      return rejectWithValue("Failed to update profile");
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
      currentUser = {
        ...currentUser,
        profile_picture: { url: uri },
        updated_at: new Date().toISOString(),
      };
      return currentUser as User;
    } catch (err: any) {
      return rejectWithValue("Failed to upload picture");
    }
  }
);

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/fetchUserById", async (id, { rejectWithValue }) => {
  try {
    if (id === currentUser.id) return currentUser;
    return {
      ...currentUser,
      id,
      first_name: "Foodhut",
      last_name: "User",
    };
  } catch (err: any) {
    return rejectWithValue("Failed to load user");
  }
});

export const deleteMyProfile = createAsyncThunk<
  { message: string },
  void,
  { state: RootState; rejectValue: string }
>("users/deleteMyProfile", async (_, { rejectWithValue }) => {
  try {
    return { message: "Account deleted" };
  } catch (err: any) {
    return rejectWithValue("Failed to delete account");
  }
});
