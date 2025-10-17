// types/auth.ts
export type SignupPayload = {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  birthday: string;
  referral_code?: string | null;
};

export type SendOtpPayload = {
  phone_number: string;
};

export type VerifyOtpPayload = {
  phone_number: string;
  otp: string;
};

export type RefreshPayload = {
  token: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type MinimalUser = {
  phone_number?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export type AuthState = {
  status: AuthStatus;
  error: string | null;

  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  otpSent: boolean;
  lastPhoneTried?: string | null;

  user: MinimalUser | null;
};
