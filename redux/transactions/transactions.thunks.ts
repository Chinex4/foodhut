import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { compactQuery, getApiErrorMessage } from "@/api/http";
import type {
  Transaction,
  TransactionsListResponse,
  TransactionsQuery,
} from "./transactions.types";

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

const normalizeDirection = (direction?: TransactionsQuery["direction"]) => {
  if (!direction) return undefined;
  return direction.toUpperCase();
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

export const fetchTransactions = createAsyncThunk<
  TransactionsListResponse,
  TransactionsQuery | undefined,
  { rejectValue: string }
>("transactions/fetchTransactions", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<BackendTransactionsResponse>("/wallets/transactions", {
      params: compactQuery({
        page: query?.page,
        per_page: query?.per_page,
        direction: normalizeDirection(query?.direction),
        type: query?.type,
        before: query?.before,
        after: query?.after,
      }),
    });

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
  { rejectValue: string }
>("transactions/fetchTransactionById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<BackendTransaction>(`/wallets/transactions/${id}`);

    return toTransaction(data);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch transaction"));
  }
});
