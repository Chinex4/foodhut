import type { RootState } from "@/store";

export const selectWalletState = (s: RootState) => s.wallet;

export const selectBanksList = (s: RootState) =>
  s.wallet.banksOrder.map((id) => s.wallet.banks[id]).filter(Boolean);

export const selectBanksMeta = (s: RootState) => s.wallet.banksMeta;
export const selectBanksQuery = (s: RootState) => s.wallet.banksQuery;
export const selectBanksStatus = (s: RootState) => s.wallet.banksStatus;

export const selectResolvedAccountName = (s: RootState) =>
  s.wallet.resolvedAccountName;
export const selectResolveStatus = (s: RootState) => s.wallet.resolveStatus;

export const selectWalletProfile = (s: RootState) => s.wallet.profile;
export const selectWalletBalanceNumber = (s: RootState) =>
  s.wallet.profile ? Number(s.wallet.profile.balance) || 0 : 0;
export const selectWalletProfileStatus = (s: RootState) =>
  s.wallet.profileStatus;

export const selectCreateBankAccountStatus = (s: RootState) =>
  s.wallet.createBankAccountStatus;
export const selectLastCreateBankMessage = (s: RootState) =>
  s.wallet.lastCreateBankMessage;

export const selectTopupStatus = (s: RootState) => s.wallet.topupStatus;
export const selectTopupUrl = (s: RootState) => s.wallet.topupUrl;

export const selectWithdrawStatus = (s: RootState) => s.wallet.withdrawStatus;
export const selectLastWithdrawMessage = (s: RootState) =>
  s.wallet.lastWithdrawMessage;

export const selectWalletError = (s: RootState) => s.wallet.error;
