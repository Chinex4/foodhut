import { createSlice } from "@reduxjs/toolkit";
import type { Order, OrdersState } from "./orders.types";
import {
  fetchOrderById,
  fetchOrders,
  payForOrder,
  updateOrderItemStatus,
} from "./orders.thunks";

const initialState: OrdersState = {
  entities: {},

  lastListIds: [],
  lastListMeta: null,
  lastListQuery: null,

  listStatus: "idle",
  byIdStatus: {},
  payStatus: {},
  updateItemStatus: {},

  error: null,
};

const upsert = (state: OrdersState, o: Order) => {
  state.entities[o.id] = o;
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrdersState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // LIST
    builder
      .addCase(fetchOrders.pending, (state, a) => {
        state.listStatus = "loading";
        state.error = null;
        state.lastListQuery = a.meta.arg ?? null;
      })
      .addCase(fetchOrders.fulfilled, (state, a) => {
        state.listStatus = "succeeded";
        const { items, meta } = a.payload;
        state.lastListIds = items.map((o) => o.id);
        state.lastListMeta = meta;
        items.forEach((o) => upsert(state, o));
      })
      .addCase(fetchOrders.rejected, (state, a) => {
        state.listStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch orders";
      });

    // BY ID
    builder
      .addCase(fetchOrderById.pending, (state, a) => {
        state.byIdStatus[a.meta.arg] = "loading";
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, a) => {
        state.byIdStatus[a.payload.id] = "succeeded";
        upsert(state, a.payload);
      })
      .addCase(fetchOrderById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to fetch order";
      });

    // PAY
    builder
      .addCase(payForOrder.pending, (state, a) => {
        state.payStatus[a.meta.arg.id] = "loading";
        state.error = null;
      })
      .addCase(payForOrder.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.payStatus[id] = "succeeded";
      })
      .addCase(payForOrder.rejected, (state, a) => {
        const id = a.meta.arg.id;
        state.payStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to initiate payment";
      });

    // UPDATE ITEM STATUS
    builder
      .addCase(updateOrderItemStatus.pending, (state, a) => {
        state.updateItemStatus[a.meta.arg.itemId] = "loading";
        state.error = null;
      })
      .addCase(updateOrderItemStatus.fulfilled, (state, a) => {
        const { order, itemId } = a.payload;
        state.updateItemStatus[itemId] = "succeeded";
        upsert(state, order);
      })
      .addCase(updateOrderItemStatus.rejected, (state, a) => {
        const itemId = a.meta.arg.itemId;
        state.updateItemStatus[itemId] = "failed";
        state.error =
          (a.payload as string) || "Failed to update order item status";
      });
  },
});

export const { clearOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;
