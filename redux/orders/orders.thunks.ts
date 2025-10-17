// redux/orders/orders.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  OrdersListResponse,
  OrdersQuery,
  Order,
  OrderId,
  PayOrderPayload,
  PayOrderResult,
  UpdateOrderItemStatusPayload,
} from "./orders.types";

const BASE = "/orders";

const buildQuery = (q?: OrdersQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  if (q.status) p.set("status", q.status);
  if (q.kitchen_id) p.set("kitchen_id", q.kitchen_id);
  const s = p.toString();
  return s ? `?${s}` : "";
};

// LIST
export const fetchOrders = createAsyncThunk<
  OrdersListResponse,
  OrdersQuery | undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}${buildQuery(query)}`);
    return res.data as OrdersListResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch orders"
    );
  }
});

// BY ID
export const fetchOrderById = createAsyncThunk<
  Order,
  OrderId,
  { rejectValue: string }
>("orders/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as Order;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch order"
    );
  }
});

// PAY
export const payForOrder = createAsyncThunk<
  PayOrderResult,
  PayOrderPayload,
  { rejectValue: string }
>("orders/payForOrder", async ({ id, with: method }, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}/${id}/pay`, { with: method });
    if (method === "ONLINE") {
      return { id, with: "ONLINE", url: res.data?.url as string };
    }
    return {
      id,
      with: "WALLET",
      message: res.data?.message ?? "Payment successful",
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to initiate payment"
    );
  }
});

export const updateOrderItemStatus = createAsyncThunk<
  { message: string; order: Order; itemId: string },
  UpdateOrderItemStatusPayload,
  { rejectValue: string }
>(
  "orders/updateOrderItemStatus",
  async ({ orderId, itemId, status, as_kitchen }, { rejectWithValue }) => {
    try {
      const body: any = { status };
      if (typeof as_kitchen === "boolean") body.as_kitchen = as_kitchen;

      const res = await api.put(
        `${BASE}/${orderId}/items/${itemId}/status`,
        body
      );
      const refreshed = await api.get(`${BASE}/${orderId}`);
      return {
        message: res.data?.message ?? "Order item status updated successfully",
        order: refreshed.data as Order,
        itemId,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Failed to update order item status"
      );
    }
  }
);
