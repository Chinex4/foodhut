import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { compactQuery, getApiErrorMessage, toNumberString } from "@/api/http";
import { fetchWalletPointers, pickWalletId } from "./wallet.api";
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

type BackendTransaction = {
  amount: string;
  direction: "INCOMING" | "OUTGOING";
};

type BackendTransactionsResponse = {
  items: BackendTransaction[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

type FetchBankAccountDetailsSuccessResponse = {
  account_name: string;
  _tag: "FetchBankAccountDetailsSuccessResponse";
};

type CreateTopupLinkSuccessResponse = {
  url: string;
  _tag: "CreateTopupLinkSuccessResponse";
};

type WithdrawFundsSuccessResponse = {
  message: string;
  transaction_id: string;
  transfer_code?: string;
  status: string;
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

const resolveWalletId = async (opts?: { as_kitchen?: boolean; wallet_id?: string }) => {
  if (opts?.wallet_id) return { walletId: opts.wallet_id, walletType: "unknown" as const, pointers: null };

  const pointers = await fetchWalletPointers();
  const picked = pickWalletId(pointers, { as_kitchen: opts?.as_kitchen });
  return {
    walletId: picked.walletId,
    walletType: picked.walletType,
    pointers,
  };
};

const fetchWalletBalance = async (walletId: string): Promise<number> => {
  let page = 1;
  const per_page = 100;
  let totalPages = 1;
  let balance = 0;

  while (page <= totalPages) {
    const { data } = await api.get<BackendTransactionsResponse>(
      `/wallets/${walletId}/transactions`,
      {
        params: compactQuery({ page, per_page }),
      }
    );

    const items = data?.items ?? [];
    for (const tx of items) {
      const amount = Number(tx.amount) || 0;
      balance += tx.direction === "INCOMING" ? amount : -amount;
    }

    const total = data?.meta?.total ?? items.length;
    totalPages = Math.max(1, Math.ceil(total / per_page));
    page += 1;

    if (page > 3) {
      // Prevent very large loops on first profile fetch.
      break;
    }
  }

  return Math.max(0, balance);
};

export const fetchBanks = createAsyncThunk<
  BanksListResponse,
  BanksQuery | undefined,
  { rejectValue: string }
>("wallet/fetchBanks", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<BackendBank[]>("/wallets/banks");
    const banks = (data ?? []).map(toBank);
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
    // Current backend returns all wallet IDs available to the user in the /profile response.
    const { data } = await api.get<any>("/wallets/profile");

    const pointers = {
      user: data?.user ?? null,
      kitchen: data?.kitchen ?? null,
      rider: data?.rider ?? null,
    };

    const picked = pickWalletId(pointers, { as_kitchen: opts?.as_kitchen });

    if (!picked.walletId) {
      return {
        id: "",
        owner_id: "",
        balance: "0",
        wallet_type: "unknown",
        metadata: {
          user_wallet_id: pointers.user,
          kitchen_wallet_id: pointers.kitchen,
          rider_wallet_id: pointers.rider,
          selected_wallet_id: null,
        },
        created_at: Date.now(),
        updated_at: null,
      };
    }

    // If we picked a specific wallet other than the default profile one, we might need its balance.
    // However, the /wallets/profile typically returns the default wallet's balance.
    // To be safe and efficient, we use the balance from the profile if it matches our picked ID.
    const balance = data.id === picked.walletId ? String(data.balance ?? 0) : String(await fetchWalletBalance(picked.walletId));

    return {
      id: picked.walletId,
      owner_id: data.owner_id ?? "",
      balance,
      wallet_type: picked.walletType,
      metadata: {
        user_wallet_id: pointers.user,
        kitchen_wallet_id: pointers.kitchen,
        rider_wallet_id: pointers.rider,
        selected_wallet_id: picked.walletId,
      },
      created_at: data.created_at ?? Date.now(),
      updated_at: data.updated_at ?? null,
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
    const { walletId } = await resolveWalletId({
      as_kitchen: body.as_kitchen,
      wallet_id: body.wallet_id,
    });

    if (!walletId) {
      return rejectWithValue("Wallet profile not found");
    }

    const { data } = await api.post<CreateTopupLinkSuccessResponse>(
      `/wallets/${walletId}/top-up`,
      {
        amount: body.amount,
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
    const { walletId } = await resolveWalletId({
      as_kitchen: body.as_kitchen,
      wallet_id: body.wallet_id,
    });

    if (!walletId) {
      return rejectWithValue("Wallet profile not found");
    }

    const { data } = await api.post<WithdrawFundsSuccessResponse>(
      `/wallets/${walletId}/withdraw`,
      {
        account_number: body.account_number,
        bank_code: body.bank_code,
        account_name: body.account_name,
        amount: toNumberString(body.amount),
      }
    );

    return { message: data.message || "Withdrawal request placed" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to withdraw funds"));
  }
});
