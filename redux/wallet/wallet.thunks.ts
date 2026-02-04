import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockBanks, mockWalletProfile } from "@/utils/mockData";
import type {
  BanksListResponse,
  BanksQuery,
  CreateBankAccountPayload,
  MessageResult,
  ResolveAccountPayload,
  ResolveAccountResponse,
  TopupPayload,
  TopupResponse,
  WalletProfile,
  WithdrawPayload,
} from "./wallet.types";

let walletProfile: WalletProfile = { ...mockWalletProfile };
let banks = [...mockBanks];

export const fetchBanks = createAsyncThunk<
  BanksListResponse,
  BanksQuery | undefined,
  { rejectValue: string }
>("wallet/fetchBanks", async (query, { rejectWithValue }) => {
  try {
    const page = query?.page ?? 1;
    const perPage = query?.per_page ?? banks.length;
    const search = query?.search?.toLowerCase();
    const filtered = search
      ? banks.filter((b) => b.name.toLowerCase().includes(search))
      : banks;
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage);
    return {
      items,
      meta: { page, per_page: perPage, total: filtered.length },
    };
  } catch (err: any) {
    return rejectWithValue("Failed to fetch banks");
  }
});

export const resolveBankAccount = createAsyncThunk<
  ResolveAccountResponse,
  ResolveAccountPayload,
  { rejectValue: string }
>("wallet/resolveBankAccount", async (body, { rejectWithValue }) => {
  try {
    return { account_name: "Foodhut Account" };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to resolve account details"
    );
  }
});

export const fetchWalletProfile = createAsyncThunk<
  WalletProfile,
  { as_kitchen?: boolean } | undefined,
  { rejectValue: string }
>("wallet/fetchWalletProfile", async (opts, { rejectWithValue }) => {
  try {
    return walletProfile;
  } catch (err: any) {
    return rejectWithValue(
      "Failed to fetch wallet profile"
    );
  }
});

export const createBankAccount = createAsyncThunk<
  MessageResult,
  CreateBankAccountPayload,
  { rejectValue: string }
>("wallet/createBankAccount", async (body, { rejectWithValue }) => {
  try {
    return { message: "Verification request sent" };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to create bank account"
    );
  }
});

export const createTopupLink = createAsyncThunk<
  TopupResponse,
  TopupPayload,
  { rejectValue: string }
>("wallet/createTopupLink", async (body, { rejectWithValue }) => {
  try {
    return { url: "https://foodhut.app/topup/mock" };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to create top-up link"
    );
  }
});

export const withdrawFunds = createAsyncThunk<
  MessageResult,
  WithdrawPayload,
  { rejectValue: string }
>("wallet/withdrawFunds", async (body, { rejectWithValue }) => {
  try {
    walletProfile = {
      ...walletProfile,
      balance: String(
        Math.max(0, Number(walletProfile.balance) - Number(body.amount))
      ),
      updated_at: new Date().toISOString(),
    };
    return { message: "Withdrawal request placed" };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to withdraw funds"
    );
  }
});
