// redux/wallet/wallet.slice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { Bank, WalletState } from "./wallet.types";
import {
  createBankAccount,
  createTopupLink,
  fetchBanks,
  fetchWalletProfile,
  resolveBankAccount,
  withdrawFunds,
} from "./wallet.thunks";

const initialState: WalletState = {
  banks: {},
  banksOrder: [],
  banksMeta: null,
  banksQuery: null,
  banksStatus: "idle",

  resolveStatus: "idle",
  resolvedAccountName: null,

  profile: null,
  profileStatus: "idle",

  createBankAccountStatus: "idle",
  lastCreateBankMessage: null,

  topupStatus: "idle",
  topupUrl: null,

  withdrawStatus: "idle",
  lastWithdrawMessage: null,

  error: null,
};

const upsertBanks = (state: WalletState, banks: Bank[]) => {
  for (const b of banks) state.banks[b.id] = b;
  state.banksOrder = banks.map((b) => b.id);
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletState(state) {
      Object.assign(state, initialState);
    },
    resetResolvedAccount(state) {
      state.resolvedAccountName = null;
      state.resolveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    // --- BANKS
    builder
      .addCase(fetchBanks.pending, (state, a) => {
        state.banksStatus = "loading";
        state.error = null;
        state.banksQuery = a.meta.arg ?? null;
      })
      .addCase(fetchBanks.fulfilled, (state, a) => {
        state.banksStatus = "succeeded";
        state.banksMeta = a.payload.meta;
        upsertBanks(state, a.payload.items);
      })
      .addCase(fetchBanks.rejected, (state, a) => {
        state.banksStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch banks";
      });

    // --- RESOLVE ACCOUNT
    builder
      .addCase(resolveBankAccount.pending, (state) => {
        state.resolveStatus = "loading";
        state.error = null;
        state.resolvedAccountName = null;
      })
      .addCase(resolveBankAccount.fulfilled, (state, a) => {
        state.resolveStatus = "succeeded";
        state.resolvedAccountName = a.payload.account_name;
      })
      .addCase(resolveBankAccount.rejected, (state, a) => {
        state.resolveStatus = "failed";
        state.error =
          (a.payload as string) || "Failed to resolve account details";
      });

    // --- PROFILE
    builder
      .addCase(fetchWalletProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(fetchWalletProfile.fulfilled, (state, a) => {
        state.profileStatus = "succeeded";
        state.profile = a.payload;
      })
      .addCase(fetchWalletProfile.rejected, (state, a) => {
        state.profileStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch wallet profile";
      });

    // --- CREATE BANK ACCOUNT
    builder
      .addCase(createBankAccount.pending, (state) => {
        state.createBankAccountStatus = "loading";
        state.error = null;
        state.lastCreateBankMessage = null;
      })
      .addCase(createBankAccount.fulfilled, (state, a) => {
        state.createBankAccountStatus = "succeeded";
        state.lastCreateBankMessage = a.payload.message;
      })
      .addCase(createBankAccount.rejected, (state, a) => {
        state.createBankAccountStatus = "failed";
        state.error = (a.payload as string) || "Failed to create bank account";
      });

    // --- TOPUP
    builder
      .addCase(createTopupLink.pending, (state) => {
        state.topupStatus = "loading";
        state.error = null;
        state.topupUrl = null;
      })
      .addCase(createTopupLink.fulfilled, (state, a) => {
        state.topupStatus = "succeeded";
        state.topupUrl = a.payload.url;
      })
      .addCase(createTopupLink.rejected, (state, a) => {
        state.topupStatus = "failed";
        state.error = (a.payload as string) || "Failed to create top-up link";
      });

    // --- WITHDRAW
    builder
      .addCase(withdrawFunds.pending, (state) => {
        state.withdrawStatus = "loading";
        state.error = null;
        state.lastWithdrawMessage = null;
      })
      .addCase(withdrawFunds.fulfilled, (state, a) => {
        state.withdrawStatus = "succeeded";
        state.lastWithdrawMessage = a.payload.message;
      })
      .addCase(withdrawFunds.rejected, (state, a) => {
        state.withdrawStatus = "failed";
        state.error = (a.payload as string) || "Failed to withdraw funds";
      });
  },
});

export const { clearWalletState, resetResolvedAccount } = walletSlice.actions;
export default walletSlice.reducer;
