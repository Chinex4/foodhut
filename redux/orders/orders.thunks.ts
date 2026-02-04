// redux/orders/orders.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mockOrders } from "@/utils/mockData";
import type {
  OrdersListResponse,
  OrdersQuery,
  Order,
  OrderId,
  PayOrderPayload,
  PayOrderResult,
  UpdateOrderItemStatusPayload,
  UpdateOrderStatusPayload,
} from "./orders.types";

let orders: Order[] = [...mockOrders];

export const addMockOrder = (order: Order) => {
  orders = [order, ...orders];
};

const listOrders = (q?: OrdersQuery): OrdersListResponse => {
  const page = q?.page ?? 1;
  const perPage = q?.per_page ?? orders.length;
  let filtered = [...orders];
  if (q?.status) filtered = filtered.filter((o) => o.status === q.status);
  if (q?.kitchen_id)
    filtered = filtered.filter((o) => o.kitchen_id === q.kitchen_id);
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  return {
    items,
    meta: { page, per_page: perPage, total: filtered.length },
  };
};

// LIST
export const fetchOrders = createAsyncThunk<
  OrdersListResponse,
  OrdersQuery | undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (query, { rejectWithValue }) => {
  try {
    return listOrders(query);
  } catch (err: any) {
    return rejectWithValue("Failed to fetch orders");
  }
});

// BY ID
export const fetchOrderById = createAsyncThunk<
  Order,
  OrderId,
  { rejectValue: string }
>("orders/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const found = orders.find((o) => o.id === id);
    if (!found) return rejectWithValue("Failed to fetch order");
    return found;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch order");
  }
});

// PAY
export const payForOrder = createAsyncThunk<
  PayOrderResult,
  PayOrderPayload,
  { rejectValue: string }
>("orders/payForOrder", async ({ id, with: method }, { rejectWithValue }) => {
  try {
    if (method === "ONLINE") {
      return {
        id,
        with: "ONLINE",
        url: `https://foodhut.app/pay/${id}`,
      };
    }
    return {
      id,
      with: "WALLET",
      message: "Payment successful",
    };
  } catch (err: any) {
    return rejectWithValue("Failed to initiate payment");
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
      orders = orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updated_at: new Date().toISOString(),
            }
          : o
      );
      const refreshed = orders.find((o) => o.id === orderId)!;
      return {
        message: "Order item status updated successfully",
        order: refreshed as Order,
        itemId,
      };
    } catch (err: any) {
      return rejectWithValue("Failed to update order item status");
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  { message: string; order: Order },
  UpdateOrderStatusPayload,
  { rejectValue: any }
>(
  "orders/updateOrderStatus",
  async ({ orderId, status, as_kitchen }, { rejectWithValue }) => {
    try {
      orders = orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updated_at: new Date().toISOString(),
            }
          : o
      );
      const refreshed = orders.find((o) => o.id === orderId)!;
      return {
        message: "Order status updated successfully",
        order: refreshed as Order,
      };
    } catch (err: any) {
      return rejectWithValue({ message: "Failed to update order status" });
    }
  }
);
