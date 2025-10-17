import type { RootState } from "@/store";
import type { OrderId, OrderItemId } from "./orders.types";

export const selectOrdersState = (s: RootState) => s.orders;

export const selectOrdersList = (s: RootState) =>
  s.orders.lastListIds.map((id) => s.orders.entities[id]).filter(Boolean);

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

export const selectOrdersError = (s: RootState) => s.orders.error;
export const selectOrdersListStatus = (s: RootState) => s.orders.listStatus;
