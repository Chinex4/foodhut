export type SignupPayload = {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  referral_code?: string | null;
};

export type SendOtpPayload =
  | {
      phone_number: string;
      email?: never;
    }
  | {
      email: string;
      phone_number?: never;
    };

export type VerifyOtpPayload =
  | {
      phone_number: string;
      otp: string;
      email?: never;
    }
  | {
      email: string;
      otp: string;
      phone_number?: never;
    };

export type Tokens = {
  access_token: string;
  refresh_token?: string | null;
};

export type MinimalUser = {
  id?: string;
  phone_number?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  has_kitchen?: boolean;
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
