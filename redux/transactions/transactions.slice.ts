import { createSlice } from "@reduxjs/toolkit";
import type { TransactionsState, Transaction } from "./transactions.types";
import { fetchTransactionById, fetchTransactions } from "./transactions.thunks";

const initialState: TransactionsState = {
  entities: {},
  lastListIds: [],
  lastListMeta: null,
  lastListQuery: null,
  listStatus: "idle",
  byIdStatus: {},
  error: null,
};

const upsert = (state: TransactionsState, t: Transaction) => {
  state.entities[t.id] = t;
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactionsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state, a) => {
        state.listStatus = "loading";
        state.error = null;
        state.lastListQuery = a.meta.arg ?? null;
      })
      .addCase(fetchTransactions.fulfilled, (state, a) => {
        state.listStatus = "succeeded";
        const { items, meta } = a.payload;
        state.lastListIds = items.map((x) => x.id);
        state.lastListMeta = meta;
        items.forEach((x) => upsert(state, x));
      })
      .addCase(fetchTransactions.rejected, (state, a) => {
        state.listStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch transactions";
      });

    builder
      .addCase(fetchTransactionById.pending, (state, a) => {
        state.byIdStatus[a.meta.arg] = "loading";
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, a) => {
        state.byIdStatus[a.payload.id] = "succeeded";
        upsert(state, a.payload);
      })
      .addCase(fetchTransactionById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to fetch transaction";
      });
  },
});

export const { clearTransactionsState } = transactionsSlice.actions;
export default transactionsSlice.reducer;
