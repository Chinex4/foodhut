import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { getMediaUrl } from "@/api/storage";
import type {
  KitchenSummary,
  MealSummary,
  Order,
  OrderId,
  OrderItem,
  OrderStatus,
  OrdersListResponse,
  OrdersQuery,
  OwnerSummary,
  PayOrderPayload,
  PayOrderResult,
  UpdateOrderItemStatusPayload,
  UpdateOrderStatusPayload,
} from "./orders.types";

type BackendOrderItem = {
  id?: string;
  meal_id: string;
  price: string | number;
  quantity: number;
  meal?: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    original_price?: string | number;
    kitchen_id?: string;
    is_available?: boolean;
    likes?: number;
    rating?: string | number;
    cover_image_id?: string | null;
    cover_image?: {
      id: string;
      url?: string | null;
      meta?: Record<string, string | null | undefined> | null;
    } | null;
    created_at?: number | string;
    updated_at?: number | string | null;
  };
};

type BackendOrder = {
  id: string;
  status: OrderStatus;
  payment_method: "WALLET" | "ONLINE";
  delivery_fee: string | number;
  service_fee: string | number;
  sub_total: string | number;
  total: string | number;
  delivery_address: string;
  delivery_date: number | string | null;
  dispatch_rider_note: string | null;
  items: BackendOrderItem[];
  kitchen_id: string;
  owner_id: string;
  kitchen?: {
    id: string;
    name: string;
  };
  owner?: BackendUser;
  created_at: number;
  updated_at: number | null;
};

type FetchOrdersSuccessResponse = {
  items: BackendOrder[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
  _tag: "FetchOrdersSuccessResponse";
};

type BackendUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

type PayForOrderByIdSuccessResponse = {
  url?: string;
  _tag: "PayForOrderByIdSuccessResponse";
};

const toOrderItemId = (orderId: string, item: BackendOrderItem, index: number) =>
  item.id ?? `${orderId}:${item.meal_id}:${index}`;

const toKitchenSummary = (order: BackendOrder): KitchenSummary => ({
  id: order.kitchen?.id ?? order.kitchen_id,
  name: order.kitchen?.name ?? "Kitchen",
  address: "",
  phone_number: "",
  type: "",
  opening_time: "",
  closing_time: "",
  delivery_time: "",
  preparation_time: "",
  rating: 0,
  likes: 0,
  is_available: true,
  owner_id: order.owner_id,
  cover_image: null,
  city_id: null,
  created_at: order.created_at,
  updated_at: order.updated_at,
});

const toMealSummary = (item: BackendOrderItem, order: BackendOrder): MealSummary => {
  const meal = item.meal;

  return {
    id: meal?.id ?? item.meal_id,
    name: meal?.name ?? "Meal",
    description: meal?.description ?? "",
    price: meal?.price ?? item.price,
    original_price: meal?.original_price ?? meal?.price ?? item.price,
    is_available: meal?.is_available ?? true,
    rating: meal?.rating ?? 0,
    likes: meal?.likes ?? 0,
    kitchen_id: meal?.kitchen_id ?? order.kitchen_id,
    cover_image: getMediaUrl(meal?.cover_image, meal?.cover_image_id)
      ? {
          id: meal?.cover_image_id ?? meal?.cover_image?.id,
          url: getMediaUrl(meal?.cover_image, meal?.cover_image_id) ?? "",
        }
      : null,
    created_at: meal?.created_at ?? order.created_at,
    updated_at: meal?.updated_at ?? order.updated_at,
  };
};

const toOwnerSummary = (order: BackendOrder): OwnerSummary => ({
  id: order.owner?.id ?? order.owner_id,
  email: order.owner?.email ?? "",
  first_name: order.owner?.first_name ?? "Foodhut",
  last_name: order.owner?.last_name ?? "User",
  phone_number: order.owner?.phone_number ?? "",
});

const toOrder = (order: BackendOrder): Order => {
  const items = (order.items ?? []).map(
    (item, index): OrderItem => ({
      id: toOrderItemId(order.id, item, index),
      meal_id: item.meal_id,
      meal: toMealSummary(item, order),
      price: item.price,
      quantity: item.quantity,
    })
  );

  return {
    id: order.id,
    created_at: order.created_at,
    updated_at: order.updated_at,
    delivery_address: order.delivery_address,
    delivery_date: order.delivery_date,
    dispatch_rider_note: order.dispatch_rider_note,
    kitchen_id: order.kitchen_id,
    kitchen: toKitchenSummary(order),
    owner_id: order.owner_id,
    owner: toOwnerSummary(order),
    payment_method: order.payment_method,
    status: order.status,
    items,
    sub_total: order.sub_total,
    total: order.total,
    service_fee: order.service_fee,
    delivery_fee: order.delivery_fee,
  };
};

// LIST
export const fetchOrders = createAsyncThunk<
  OrdersListResponse,
  OrdersQuery | undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (query, { rejectWithValue }) => {
  try {
    const statusValues = Array.isArray(query?.status)
      ? query?.status
      : query?.status
        ? [query.status]
        : undefined;

    const { data } = await api.get<FetchOrdersSuccessResponse>("/orders", {
      params: {
        page: query?.page,
        per_page: query?.per_page,
        kitchen_id: query?.kitchen_id,
        status: statusValues,
      },
    });

    return {
      items: (data.items ?? []).map(toOrder),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch orders"));
  }
});

// BY ID
export const fetchOrderById = createAsyncThunk<Order, OrderId, { rejectValue: string }>(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendOrder>(`/orders/${id}`);
      return toOrder(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch order"));
    }
  }
);

// PAY
export const payForOrder = createAsyncThunk<
  PayOrderResult,
  PayOrderPayload,
  { rejectValue: string }
>("orders/payForOrder", async ({ id, with: method }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<PayForOrderByIdSuccessResponse>(`/orders/${id}/pay`, {
      with: method,
    });

    if (method === "ONLINE") {
      if (!data?.url) {
        return rejectWithValue("Payment link not available");
      }
      return {
        id,
        with: "ONLINE",
        url: data.url,
      };
    }

    return {
      id,
      with: "WALLET",
      message: "Payment successful",
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to initiate payment"));
  }
});

export const updateOrderItemStatus = createAsyncThunk<
  { message: string; order: Order; itemId: string },
  UpdateOrderItemStatusPayload,
  { rejectValue: string }
>(
  "orders/updateOrderItemStatus",
  async ({ orderId, itemId, status, as_kitchen }, { dispatch, rejectWithValue }) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
        as_kitchen: !!as_kitchen,
      });

      const order = await dispatch(fetchOrderById(orderId)).unwrap();

      return {
        message: "Order item status updated successfully",
        order,
        itemId,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update order item status"));
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  { message: string; order: Order },
  UpdateOrderStatusPayload,
  { rejectValue: string }
>("orders/updateOrderStatus", async ({ orderId, status, as_kitchen }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/orders/${orderId}/status`, {
      status,
      as_kitchen: !!as_kitchen,
    });

    const order = await dispatch(fetchOrderById(orderId)).unwrap();

    return {
      message: "Order status updated successfully",
      order,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update order status"));
  }
});
