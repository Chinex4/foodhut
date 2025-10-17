// redux/auth/auth.selectors.ts
import type { RootState } from "@/store";

export const selectAuth = (s: RootState) => s.auth;

export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectAuthError = (s: RootState) => s.auth.error;

export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAccessToken = (s: RootState) => s.auth.accessToken;
export const selectRefreshToken = (s: RootState) => s.auth.refreshToken;

export const selectOtpSent = (s: RootState) => s.auth.otpSent;
export const selectLastPhoneTried = (s: RootState) => s.auth.lastPhoneTried;

export const selectUser = (s: RootState) => s.auth.user;
