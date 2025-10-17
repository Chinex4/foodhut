export type TransactionId = string;
export type Direction = "INCOMING" | "OUTGOING";

export type Transaction = {
  id: TransactionId;
  amount: string | number;
  direction: Direction;
  note: string | null;
  user_id: string;
  created_at: string;
  updated_at: string | null;
};

export type TransactionsQuery = {
  page?: number;
  per_page?: number;
};

export type TransactionsListResponse = {
  items: Transaction[];
  meta: { page: number; per_page: number; total: number };
};

export type TransactionsStatus = "idle" | "loading" | "succeeded" | "failed";

export type TransactionsState = {
  entities: Record<TransactionId, Transaction>;

  lastListIds: TransactionId[];
  lastListMeta: { page: number; per_page: number; total: number } | null;
  lastListQuery: TransactionsQuery | null;

  listStatus: TransactionsStatus;
  byIdStatus: Record<TransactionId, TransactionsStatus>;

  error: string | null;
};
