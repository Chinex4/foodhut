import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  Transaction,
  TransactionsListResponse,
  TransactionsQuery,
} from "./transactions.types";

const BASE = "/transactions";

const buildQuery = (q?: TransactionsQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const fetchTransactions = createAsyncThunk<
  TransactionsListResponse,
  TransactionsQuery | undefined,
  { rejectValue: string }
>("transactions/fetchTransactions", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}${buildQuery(query)}`);
    return res.data as TransactionsListResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch transactions"
    );
  }
});

export const fetchTransactionById = createAsyncThunk<
  Transaction,
  string,
  { rejectValue: string }
>("transactions/fetchTransactionById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as Transaction;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch transaction"
    );
  }
});
