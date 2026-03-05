export type TransactionId = string;
export type Direction = "INCOMING" | "OUTGOING";

export type Transaction = {
  id: TransactionId;
  amount: string | number;
  direction: Direction;
  note: string | null;
  purpose?:
    | {
        type: "ORDER";
        order_id: string;
      }
    | {
        type: "OTHER";
      };
  type?: "WALLET" | "ONLINE" | string;
  ref?: string;
  user_id: string;
  wallet_id?: string | null;
  created_at: number | string;
  updated_at: number | string | null;
};

export type TransactionsQuery = {
  page?: number;
  per_page?: number;
  direction?: "incoming" | "outgoing";
  type?: string;
  as_kitchen?: boolean;
  wallet_id?: string;
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
