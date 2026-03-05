import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import type { SendOtpPayload, SignupPayload, Tokens, VerifyOtpPayload } from "./auth.types";
import {
  clearRefreshToken,
  clearToken,
  clearUser,
  getRefreshToken,
  getToken,
  saveToken,
} from "@/storage/auth";

type VerifyOtpSuccessResponse = {
  data: {
    access_token: string;
  };
  _tag: "VerifyOtpSuccessResponse";
};

/**
 * SIGN UP
 */
export const signUp = createAsyncThunk<
  { message: string; phone_number: string },
  SignupPayload,
  { rejectValue: string }
>("auth/signUp", async (body, { rejectWithValue }) => {
  try {
    await api.post("/auth/sign-up", {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone_number: body.phone_number,
      referral_code: body.referral_code ?? undefined,
    });

    return {
      message: "OTP sent",
      phone_number: body.phone_number,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Sign up failed"));
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
    await api.post("/auth/sign-in", body);
    const identifier =
      ("phone_number" in body ? body.phone_number : body.email) ?? null;
    if (!identifier) {
      return rejectWithValue("Phone number or email is required");
    }

    return {
      message: "OTP sent",
      phone_number: identifier,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Sending OTP failed"));
  }
});

/**
 * RESEND OTP
 * Reuses sign-in endpoint with the identifier.
 */
export const resendVerificationOtp = createAsyncThunk<
  { message: string; phone_number: string },
  SendOtpPayload,
  { rejectValue: string }
>("auth/resendVerificationOtp", async (body, { rejectWithValue }) => {
  try {
    await api.post("/auth/sign-in", body);
    const identifier =
      ("phone_number" in body ? body.phone_number : body.email) ?? null;
    if (!identifier) {
      return rejectWithValue("Phone number or email is required");
    }

    return {
      message: "OTP resent",
      phone_number: identifier,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Resend OTP failed"));
  }
});

/**
 * VERIFY OTP -> access token
 */
export const verifyOtp = createAsyncThunk<
  Tokens,
  VerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<VerifyOtpSuccessResponse>("/auth/verify", body);
    const accessToken = data?.data?.access_token;

    if (!accessToken) {
      return rejectWithValue("Invalid verification response");
    }

    const tokens: Tokens = {
      access_token: accessToken,
      refresh_token: null,
    };

    await saveToken(tokens.access_token);
    await clearRefreshToken();

    return tokens;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "OTP verification failed"));
  }
});

/**
 * REFRESH TOKENS
 * Backend currently exposes OTP verification only, so we reuse persisted access token if present.
 */
export const refreshTokens = createAsyncThunk<
  Tokens,
  void,
  { rejectValue: string }
>("auth/refreshTokens", async (_, { rejectWithValue }) => {
  try {
    const access = await getToken();
    const refresh = await getRefreshToken();

    if (!access && !refresh) {
      return rejectWithValue("No session token found");
    }

    return {
      access_token: access ?? "",
      refresh_token: refresh ?? null,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Refresh failed"));
  }
});

/**
 * LOGOUT
 */
export const logout = createAsyncThunk<void, void>("auth/logout", async () => {
  await clearToken();
  await clearRefreshToken();
  await clearUser();
});
