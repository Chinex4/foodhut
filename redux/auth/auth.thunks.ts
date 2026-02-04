import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  SignupPayload,
  SendOtpPayload,
  VerifyOtpPayload,
  Tokens,
} from "./auth.types";
import {
  saveToken,
  saveRefreshToken,
  clearToken,
  clearUser,
  getRefreshToken,
} from "@/storage/auth";

/**
 * SIGN UP (credentials strategy)
 */
export const signUp = createAsyncThunk<
  { message: string; phone_number: string },
  SignupPayload,
  { rejectValue: string }
>("auth/signUp", async (body, { rejectWithValue }) => {
  try {
    return {
      message: "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue("Sign up failed");
  }
});

/**
 * SEND OTP for sign-in
 */
export const sendSignInOtp = createAsyncThunk<
  { message: string; phone_number: string },
  SendOtpPayload,
  { rejectValue: string }
>("auth/sendSignInOtp", async (body, { rejectWithValue }) => {
  try {
    return {
      message: "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue("Sending OTP failed");
  }
});

/**
 * (RE)SEND verification OTP (after signup)
 */
export const resendVerificationOtp = createAsyncThunk<
  { message: string; phone_number: string },
  SendOtpPayload,
  { rejectValue: string }
>("auth/resendVerificationOtp", async (body, { rejectWithValue }) => {
  try {
    return {
      message: "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue("Resend OTP failed");
  }
});

/**
 * VERIFY OTP -> returns tokens
 */
export const verifyOtp = createAsyncThunk<
  Tokens,
  VerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (body, { rejectWithValue }) => {
  try {
    const tokens: Tokens = {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
    };
    await saveToken(tokens.access_token);
    await saveRefreshToken(tokens.refresh_token);
    // persistUser(user) if backend returns user later
    return tokens;
  } catch (err: any) {
    return rejectWithValue("OTP verification failed");
  }
});

/**
 * REFRESH TOKENS
 */
export const refreshTokens = createAsyncThunk<
  Tokens,
  void,
  { rejectValue: string }
>("auth/refreshTokens", async (_, { rejectWithValue }) => {
  try {
    const refresh = await getRefreshToken();
    if (!refresh) return rejectWithValue("No refresh token");
    const tokens: Tokens = {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
    };
    await saveToken(tokens.access_token);
    await saveRefreshToken(tokens.refresh_token);
    return tokens;
  } catch (err: any) {
    return rejectWithValue("Refresh failed");
  }
});

/**
 * LOGOUT (local)
 */
export const logout = createAsyncThunk<void, void>(
  "auth/logout",
  async () => {
    await clearToken();
    await clearUser();
  }
);
