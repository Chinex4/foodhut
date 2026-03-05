import type { RootState } from "@/store";

export const selectReferralsState = (s: RootState) => s.referrals;
export const selectReferralsItems = (s: RootState) => s.referrals.items;
export const selectReferralsMeta = (s: RootState) => s.referrals.meta;
export const selectReferralsStatus = (s: RootState) => s.referrals.status;
export const selectReferralsError = (s: RootState) => s.referrals.error;
