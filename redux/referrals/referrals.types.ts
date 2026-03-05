export type Referral = {
  id: string;
  user_id: string;
  referred_id: string | null;
  code: string;
  balance: string;
  created_at: number | string;
  updated_at: number | string;
};

export type ReferralsState = {
  items: Referral[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  } | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
