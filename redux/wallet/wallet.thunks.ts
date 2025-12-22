import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
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

const BASE = "/wallets";

const buildQuery = (q?: BanksQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  if (q.search) p.set("search", q.search);
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const fetchBanks = createAsyncThunk<
  BanksListResponse,
  BanksQuery | undefined,
  { rejectValue: string }
>("wallet/fetchBanks", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/banks${buildQuery(query)}`);
    return res.data as BanksListResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch banks"
    );
  }
});

export const resolveBankAccount = createAsyncThunk<
  ResolveAccountResponse,
  ResolveAccountPayload,
  { rejectValue: string }
>("wallet/resolveBankAccount", async (body, { rejectWithValue }) => {
  try {
    const payload: any = { ...body };
    if (body.as_kitchen) {
      payload.as_kitchen = true;
    }
    const res = await api.post(`${BASE}/bank-account/details`, payload);
    return res.data as ResolveAccountResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to resolve account details"
    );
  }
});

export const fetchWalletProfile = createAsyncThunk<
  WalletProfile,
  { as_kitchen?: boolean } | undefined,
  { rejectValue: string }
>("wallet/fetchWalletProfile", async (opts, { rejectWithValue }) => {
  try {
    const query = opts?.as_kitchen ? "?as_kitchen=true" : "";
    const res = await api.get(`${BASE}/profile${query}`);
    return res.data as WalletProfile;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch wallet profile"
    );
  }
});

export const createBankAccount = createAsyncThunk<
  MessageResult,
  CreateBankAccountPayload,
  { rejectValue: string }
>("wallet/createBankAccount", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}/bank-account`, body);
    const message = res.data?.message ?? "Verification request sent";
    return { message };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to create bank account"
    );
  }
});

export const createTopupLink = createAsyncThunk<
  TopupResponse,
  TopupPayload,
  { rejectValue: string }
>("wallet/createTopupLink", async (body, { rejectWithValue }) => {
  try {
    const payload: any = { amount: body.amount };
    if (body.as_kitchen) {
      payload.as_kitchen = true;
    }
    const res = await api.post(`${BASE}/top-up`, payload);
    return res.data as TopupResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to create top-up link"
    );
  }
});

export const withdrawFunds = createAsyncThunk<
  MessageResult,
  WithdrawPayload,
  { rejectValue: string }
>("wallet/withdrawFunds", async (body, { rejectWithValue }) => {
  try {
    const payload: any = {
      account_number: body.account_number,
      bank_code: body.bank_code,
      account_name: body.account_name,
      amount: body.amount,
    };
    if (body.as_kitchen) {
      payload.as_kitchen = true;
    }
    const res = await api.post(`${BASE}/withdraw`, payload);
    const message = res.data?.message ?? "Withdrawal request placed";
    return { message };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to withdraw funds"
    );
  }
});
