import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { OrderId, OrderItemId, OrderStatus } from "./orders.types";

export const selectOrdersState = (s: RootState) => s.orders;

const selectOrdersEntities = (s: RootState) => s.orders.entities;
const selectOrdersLastListIds = (s: RootState) => s.orders.lastListIds;

export const selectOrdersList = createSelector(
  [selectOrdersLastListIds, selectOrdersEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter(Boolean)
);

const ONGOING_ORDER_STATUSES: OrderStatus[] = ["AWAITING_ACKNOWLEDGEMENT", "PREPARING", "IN_TRANSIT"];
const AWAITING_PAYMENT_ORDER_STATUSES: OrderStatus[] = ["AWAITING_PAYMENT"];

// Memoized subset of orders the user is still expecting
export const selectOngoingOrders = createSelector(
  [selectOrdersList],
  (orders) => orders.filter((o) => ONGOING_ORDER_STATUSES.includes(o.status))
);

export const selectAwaitingPaymentOrders = createSelector(
  [selectOrdersList],
  (orders) => orders.filter((o) => AWAITING_PAYMENT_ORDER_STATUSES.includes(o.status))
);

export const selectOrdersMeta = (s: RootState) => s.orders.lastListMeta;
export const selectOrdersQuery = (s: RootState) => s.orders.lastListQuery;

export const selectOrderById = (id: OrderId) => (s: RootState) =>
  s.orders.entities[id] ?? null;

export const makeSelectOrderByIdStatus = (id: OrderId) => (s: RootState) =>
  s.orders.byIdStatus[id] ?? "idle";

export const makeSelectPayStatus = (id: OrderId) => (s: RootState) =>
  s.orders.payStatus[id] ?? "idle";

export const makeSelectUpdateItemStatus =
  (itemId: OrderItemId) => (s: RootState) =>
    s.orders.updateItemStatus[itemId] ?? "idle";

export const makeSelectUpdateOrderStatus =
  (orderId: OrderId) => (s: RootState) =>
    s.orders.updateStatus[orderId] ?? "idle";

export const selectOrdersError = (s: RootState) => s.orders.error;
export const selectOrdersListStatus = (s: RootState) => s.orders.listStatus;
