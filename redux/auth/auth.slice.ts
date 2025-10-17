// redux/auth/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, MinimalUser, Tokens } from "./auth.types";
import {
  logout,
  resendVerificationOtp,
  sendSignInOtp,
  signUp,
  verifyOtp,
  refreshTokens,
} from "./auth.thunks";

const initialState: AuthState = {
  status: "idle",
  error: null,

  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,

  otpSent: false,
  lastPhoneTried: null,

  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(
      state,
      action: PayloadAction<{ accessToken?: string | null; refreshToken?: string | null; user?: MinimalUser | null }>
    ) {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken ?? null;
      state.refreshToken = refreshToken ?? null;
      state.isAuthenticated = Boolean(accessToken);
      state.user = user ?? null;
    },
    setUser(state, action: PayloadAction<MinimalUser | null>) {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.otpSent = false;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otpSent = true;
        state.lastPhoneTried = action.payload.phone_number;
      })
      .addCase(signUp.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || "Sign up failed";
      });

    // --- Send Sign-in OTP
    builder
      .addCase(sendSignInOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.otpSent = false;
      })
      .addCase(sendSignInOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otpSent = true;
        state.lastPhoneTried = action.payload.phone_number;
      })
      .addCase(sendSignInOtp.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || "Sending OTP failed";
      });

    // --- Resend Verification OTP
    builder
      .addCase(resendVerificationOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resendVerificationOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otpSent = true;
        state.lastPhoneTried = action.payload.phone_number;
      })
      .addCase(resendVerificationOtp.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || "Resend OTP failed";
      });

    // --- Verify OTP -> store tokens
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<Tokens>) => {
        state.status = "succeeded";
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || "OTP verification failed";
        state.isAuthenticated = false;
      });

    // --- Refresh tokens
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action: PayloadAction<Tokens>) => {
        state.status = "succeeded";
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload || "Refresh failed";
        state.isAuthenticated = false;
        state.accessToken = null;
      });

    builder
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, {
          ...state,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      });
  },
});

export const { hydrateFromStorage, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
