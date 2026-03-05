import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { getStorageFileUrl } from "@/api/storage";
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
  meal_id: string;
  price: string;
  quantity: number;
};

type BackendOrder = {
  id: string;
  status: OrderStatus;
  payment_method: "WALLET" | "ONLINE";
  delivery_fee: string;
  service_fee: string;
  sub_total: string;
  total: string;
  delivery_address: string;
  delivery_date: number;
  dispatch_rider_note: string;
  items: BackendOrderItem[];
  kitchen_id: string;
  owner_id: string;
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

type BackendKitchen = {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  type: string;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  city_id: string;
  owner_id: string;
  is_available: boolean;
  likes: number;
  rating: number;
  cover_image_id: string | null;
  city?: {
    id: string;
    name: string;
    state: string;
    created_at: number;
    updated_at: number | null;
  };
  created_at: number;
  updated_at: number | null;
};

type BackendMeal = {
  id: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  kitchen_id: string;
  is_available: boolean;
  likes: number;
  rating: number;
  cover_image_id: string;
  created_at: number;
  updated_at: number | null;
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

const kitchenCache = new Map<string, Promise<KitchenSummary>>();
const mealCache = new Map<string, Promise<MealSummary>>();
const ownerCache = new Map<string, Promise<OwnerSummary>>();

const getKitchenSummary = (kitchenId: string): Promise<KitchenSummary> => {
  const cached = kitchenCache.get(kitchenId);
  if (cached) return cached;

  const promise = api
    .get<BackendKitchen>(`/kitchens/${kitchenId}`)
    .then(({ data }) => ({
      id: data.id,
      name: data.name,
      address: data.address,
      phone_number: data.phone_number,
      type: data.type,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      delivery_time: data.delivery_time,
      preparation_time: data.preparation_time,
      rating: data.rating,
      likes: data.likes,
      is_available: data.is_available,
      owner_id: data.owner_id,
      cover_image: data.cover_image_id
        ? {
            id: data.cover_image_id,
            url: getStorageFileUrl(data.cover_image_id) ?? "",
          }
        : null,
      city_id: data.city_id,
      city: data.city,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }))
    .catch(() => ({
      id: kitchenId,
      name: "Kitchen",
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
      owner_id: "",
      cover_image: null,
      city_id: null,
      created_at: Date.now(),
      updated_at: null,
    }));

  kitchenCache.set(kitchenId, promise);
  return promise;
};

const getMealSummary = (mealId: string): Promise<MealSummary> => {
  const cached = mealCache.get(mealId);
  if (cached) return cached;

  const promise = api
    .get<BackendMeal>(`/meals/${mealId}`)
    .then(({ data }) => ({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.original_price,
      is_available: data.is_available,
      rating: data.rating,
      likes: data.likes,
      kitchen_id: data.kitchen_id,
      cover_image: data.cover_image_id
        ? {
            id: data.cover_image_id,
            url: getStorageFileUrl(data.cover_image_id) ?? "",
          }
        : null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }))
    .catch(() => ({
      id: mealId,
      name: "Meal",
      description: "",
      price: "0",
      original_price: "0",
      is_available: true,
      rating: 0,
      likes: 0,
      kitchen_id: "",
      cover_image: null,
      created_at: Date.now(),
      updated_at: null,
    }));

  mealCache.set(mealId, promise);
  return promise;
};

const getOwnerSummary = (ownerId: string): Promise<OwnerSummary> => {
  const cached = ownerCache.get(ownerId);
  if (cached) return cached;

  const promise = api
    .get<BackendUser>(`/users/${ownerId}`)
    .then(({ data }) => ({
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
    }))
    .catch(() => ({
      id: ownerId,
      email: "",
      first_name: "Foodhut",
      last_name: "User",
      phone_number: "",
    }));

  ownerCache.set(ownerId, promise);
  return promise;
};

const toOrderItemId = (orderId: string, item: BackendOrderItem, index: number) =>
  `${orderId}:${item.meal_id}:${index}`;

const hydrateOrder = async (order: BackendOrder): Promise<Order> => {
  const [kitchen, owner, items] = await Promise.all([
    getKitchenSummary(order.kitchen_id),
    getOwnerSummary(order.owner_id),
    Promise.all(
      (order.items ?? []).map(async (item, index): Promise<OrderItem> => {
        const meal = await getMealSummary(item.meal_id);
        return {
          id: toOrderItemId(order.id, item, index),
          meal_id: item.meal_id,
          meal,
          price: item.price,
          quantity: item.quantity,
        };
      })
    ),
  ]);

  return {
    id: order.id,
    created_at: order.created_at,
    updated_at: order.updated_at,
    delivery_address: order.delivery_address,
    delivery_date: order.delivery_date,
    dispatch_rider_note: order.dispatch_rider_note,
    kitchen_id: order.kitchen_id,
    kitchen,
    owner_id: order.owner_id,
    owner,
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

    const items = await Promise.all((data.items ?? []).map(hydrateOrder));

    return {
      items,
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
      return await hydrateOrder(data);
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
        as_kitchen: as_kitchen ? "true" : "false",
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
      as_kitchen: as_kitchen ? "true" : "false",
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
