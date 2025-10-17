import type { RootState } from "@/store";
import type { TransactionId } from "./transactions.types";

export const selectTransactionsState = (s: RootState) => s.transactions;

export const selectTransactionsList = (s: RootState) =>
  s.transactions.lastListIds
    .map((id) => s.transactions.entities[id])
    .filter(Boolean);

export const selectTransactionsMeta = (s: RootState) =>
  s.transactions.lastListMeta;
export const selectTransactionsQuery = (s: RootState) =>
  s.transactions.lastListQuery;

export const selectTransactionById = (id: TransactionId) => (s: RootState) =>
  s.transactions.entities[id] ?? null;

export const selectTransactionsListStatus = (s: RootState) =>
  s.transactions.listStatus;

export const makeSelectTransactionByIdStatus =
  (id: TransactionId) => (s: RootState) =>
    s.transactions.byIdStatus[id] ?? "idle";

export const selectTransactionsError = (s: RootState) => s.transactions.error;
