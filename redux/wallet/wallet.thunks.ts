import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { pickWalletId } from "./wallet.api";
import type {
  Bank,
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

type BackendBank = {
  name: string;
  code: string;
};

type FetchBankAccountDetailsSuccessResponse = {
  account_name: string;
  _tag: "FetchBankAccountDetailsSuccessResponse";
};

type FetchBanksSuccessResponse = {
  banks?: BackendBank[];
  items?: BackendBank[];
  _tag?: "FetchBanksSuccessResponse";
};

type FetchWalletByProfileSuccessResponse = {
  id: string;
  balance: number | string;
  metadata: WalletProfile["metadata"];
  owner_id: string;
  created_at: number;
  updated_at: number | null;
  _tag?: "FetchWalletByProfileSuccessResponse";
};

type CreateTopupLinkSuccessResponse = {
  url: string;
  _tag: "CreateTopupLinkSuccessResponse";
};

type WithdrawFundsSuccessResponse = {
  message?: string;
  transaction_id?: string;
  transfer_code?: string;
  status?: string;
  _tag?: string;
};

const toBank = (bank: BackendBank, index: number): Bank => ({
  id: `${bank.code}-${index}`,
  name: bank.name,
  code: bank.code,
  created_at: Date.now(),
  updated_at: null,
});

const paginateBanks = (banks: Bank[], query?: BanksQuery): BanksListResponse => {
  const page = query?.page ?? 1;
  const per_page = query?.per_page ?? banks.length ?? 1;
  const search = query?.search?.toLowerCase().trim();
  const filtered = search
    ? banks.filter((b) => b.name.toLowerCase().includes(search))
    : banks;

  const start = (page - 1) * per_page;
  const items = filtered.slice(start, start + per_page);

  return {
    items,
    meta: {
      page,
      per_page,
      total: filtered.length,
    },
  };
};

export const fetchBanks = createAsyncThunk<
  BanksListResponse,
  BanksQuery | undefined,
  { rejectValue: string }
>("wallet/fetchBanks", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<FetchBanksSuccessResponse | BackendBank[]>(
      "/wallets/banks"
    );
    const rawBanks = Array.isArray(data) ? data : data.banks ?? data.items ?? [];
    const banks = rawBanks.map(toBank);
    return paginateBanks(banks, query);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch banks"));
  }
});

export const resolveBankAccount = createAsyncThunk<
  ResolveAccountResponse,
  ResolveAccountPayload,
  { rejectValue: string }
>("wallet/resolveBankAccount", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<FetchBankAccountDetailsSuccessResponse>(
      "/wallets/bank-account/details",
      {
        account_number: body.account_number,
        bank_code: body.bank_code,
      }
    );

    return { account_name: data.account_name };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to resolve account details"));
  }
});

export const fetchWalletProfile = createAsyncThunk<
  WalletProfile,
  { as_kitchen?: boolean } | undefined,
  { rejectValue: string }
>("wallet/fetchWalletProfile", async (opts, { rejectWithValue }) => {
  try {
    const { data } =
      await api.get<FetchWalletByProfileSuccessResponse | any>("/wallets/profile");

    if (data?.id) {
      return {
        id: data.id,
        owner_id: data.owner_id ?? "",
        balance: String(data.balance ?? 0),
        wallet_type: opts?.as_kitchen ? "kitchen" : "user",
        metadata: data.metadata ?? null,
        created_at: data.created_at ?? Date.now(),
        updated_at: data.updated_at ?? null,
      };
    }

    const pointers = {
      user: data?.user ?? null,
      kitchen: data?.kitchen ?? null,
      rider: data?.rider ?? null,
    };
    const picked = pickWalletId(pointers, { as_kitchen: opts?.as_kitchen });

    return {
      id: picked.walletId ?? "",
      owner_id: "",
      balance: "0",
      wallet_type: picked.walletType,
      metadata: {
        user_wallet_id: pointers.user,
        kitchen_wallet_id: pointers.kitchen,
        rider_wallet_id: pointers.rider,
        selected_wallet_id: picked.walletId ?? null,
      },
      created_at: Date.now(),
      updated_at: null,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch wallet profile"));
  }
});

export const createBankAccount = createAsyncThunk<
  MessageResult,
  CreateBankAccountPayload,
  { rejectValue: string }
>("wallet/createBankAccount", async (body, { rejectWithValue }) => {
  try {
    // Backend spec does not expose dedicated bank account creation for wallets.
    // We validate details and treat it as successful setup intent.
    await api.post<FetchBankAccountDetailsSuccessResponse>("/wallets/bank-account/details", {
      account_number: body.account_number,
      bank_code: body.bank_code,
    });

    return { message: "Bank account verified" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create bank account"));
  }
});

export const createTopupLink = createAsyncThunk<
  TopupResponse,
  TopupPayload,
  { rejectValue: string }
>("wallet/createTopupLink", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<CreateTopupLinkSuccessResponse>(
      "/wallets/top-up",
      {
        amount: Number(body.amount),
      }
    );

    return { url: data.url };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create top-up link"));
  }
});

export const withdrawFunds = createAsyncThunk<
  MessageResult,
  WithdrawPayload,
  { rejectValue: string }
>("wallet/withdrawFunds", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<WithdrawFundsSuccessResponse>(
      "/wallets/withdraw",
      {
        account_number: body.account_number,
        bank_code: body.bank_code,
        account_name: body.account_name,
        amount: Number(body.amount),
      }
    );

    return { message: data.message || "Withdrawal request placed" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to withdraw funds"));
  }
});
