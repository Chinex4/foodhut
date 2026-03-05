import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { compactQuery, getApiErrorMessage } from "@/api/http";
import { fetchWalletPointers, pickWalletId } from "@/redux/wallet/wallet.api";
import type {
  Transaction,
  TransactionsListResponse,
  TransactionsQuery,
} from "./transactions.types";
import type { RootState } from "@/store";

type BackendTransaction = {
  id: string;
  amount: string;
  created_at: number;
  updated_at: number | null;
  direction: "INCOMING" | "OUTGOING";
  note: string;
  purpose:
    | {
        type: "ORDER";
        order_id: string;
      }
    | {
        type: "OTHER";
      };
  type: "WALLET" | "ONLINE";
  ref: string;
  user_id: string;
  wallet_id: string | null;
};

type BackendTransactionsResponse = {
  items: BackendTransaction[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

const toTransaction = (tx: BackendTransaction): Transaction => ({
  id: tx.id,
  amount: tx.amount,
  direction: tx.direction,
  note: tx.note,
  purpose: tx.purpose,
  type: tx.type,
  ref: tx.ref,
  user_id: tx.user_id,
  wallet_id: tx.wallet_id,
  created_at: tx.created_at,
  updated_at: tx.updated_at,
});

const resolveWalletIdForTransactions = async (query?: TransactionsQuery) => {
  if (query?.wallet_id) return query.wallet_id;

  const pointers = await fetchWalletPointers();
  return pickWalletId(pointers, { as_kitchen: query?.as_kitchen }).walletId;
};

export const fetchTransactions = createAsyncThunk<
  TransactionsListResponse,
  TransactionsQuery | undefined,
  { rejectValue: string }
>("transactions/fetchTransactions", async (query, { rejectWithValue }) => {
  try {
    const walletId = await resolveWalletIdForTransactions(query);
    if (!walletId) {
      return {
        items: [],
        meta: {
          page: query?.page ?? 1,
          per_page: query?.per_page ?? 20,
          total: 0,
        },
      };
    }

    const { data } = await api.get<BackendTransactionsResponse>(
      `/wallets/${walletId}/transactions`,
      {
        params: compactQuery({
          page: query?.page,
          per_page: query?.per_page,
          direction: query?.direction,
          type: query?.type,
        }),
      }
    );

    return {
      items: (data.items ?? []).map(toTransaction),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch transactions"));
  }
});

export const fetchTransactionById = createAsyncThunk<
  Transaction,
  string,
  { state: RootState; rejectValue: string }
>("transactions/fetchTransactionById", async (id, { getState, rejectWithValue }) => {
  try {
    let walletId = getState().wallet.profile?.id ?? null;

    if (!walletId) {
      const pointers = await fetchWalletPointers();
      walletId = pickWalletId(pointers).walletId;
    }

    if (!walletId) {
      return rejectWithValue("Wallet profile not found");
    }

    const { data } = await api.get<BackendTransaction>(
      `/wallets/${walletId}/transactions/${id}`
    );

    return toTransaction(data);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch transaction"));
  }
});
