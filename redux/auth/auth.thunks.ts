import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  SignupPayload,
  SendOtpPayload,
  VerifyOtpPayload,
  RefreshPayload,
  Tokens,
} from "./auth.types";
import {
  saveToken,
  saveRefreshToken,
  saveUser as persistUser,
  clearToken,
  clearUser,
  getRefreshToken,
} from "@/storage/auth";

const BASE = "/auth";

/**
 * SIGN UP (credentials strategy)
 */
export const signUp = createAsyncThunk<
  { message: string; phone_number: string },
  SignupPayload,
  { rejectValue: string }
>("auth/signUp", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}/sign-up/strategy/credentials`, body);
    return {
      message: res.data?.error ?? "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Sign up failed");
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
    const res = await api.post(`${BASE}/sign-in/strategy/phone`, body);
    return {
      message: res.data?.error ?? "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Sending OTP failed");
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
    const res = await api.post(`${BASE}/verification/send-otp`, body);
    return {
      message: res.data?.error ?? "OK",
      phone_number: body.phone_number,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Resend OTP failed");
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
    const res = await api.post(`${BASE}/verification/verify-otp`, body);
    const tokens: Tokens = {
      access_token: res.data?.access_token,
      refresh_token: res.data?.refresh_token,
    };
    await saveToken(tokens.access_token);
    await saveRefreshToken(tokens.refresh_token);
    // persistUser(user) if backend returns user later
    return tokens;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "OTP verification failed"
    );
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
    const body: RefreshPayload = { token: refresh };
    const res = await api.post(`${BASE}/refresh`, body);
    const tokens: Tokens = {
      access_token: res.data?.access_token,
      refresh_token: res.data?.refresh_token,
    };
    await saveToken(tokens.access_token);
    await saveRefreshToken(tokens.refresh_token);
    return tokens;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Refresh failed");
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
