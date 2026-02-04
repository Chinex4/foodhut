import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockTransactions } from "@/utils/mockData";
import type {
  Transaction,
  TransactionsListResponse,
  TransactionsQuery,
} from "./transactions.types";

let transactions: Transaction[] = [...mockTransactions];

export const fetchTransactions = createAsyncThunk<
  TransactionsListResponse,
  TransactionsQuery | undefined,
  { rejectValue: string }
>("transactions/fetchTransactions", async (query, { rejectWithValue }) => {
  try {
    const page = query?.page ?? 1;
    const perPage = query?.per_page ?? transactions.length;
    const start = (page - 1) * perPage;
    const items = transactions.slice(start, start + perPage);
    return {
      items,
      meta: { page, per_page: perPage, total: transactions.length },
    };
  } catch (err: any) {
    return rejectWithValue(
      "Failed to fetch transactions"
    );
  }
});

export const fetchTransactionById = createAsyncThunk<
  Transaction,
  string,
  { rejectValue: string }
>("transactions/fetchTransactionById", async (id, { rejectWithValue }) => {
  try {
    const found = transactions.find((t) => t.id === id);
    if (!found) return rejectWithValue("Failed to fetch transaction");
    return found;
  } catch (err: any) {
    return rejectWithValue(
      "Failed to fetch transaction"
    );
  }
});
