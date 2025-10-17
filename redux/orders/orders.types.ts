export type OrderId = string;
export type OrderItemId = string;
export type MealId = string;
export type KitchenId = string;
export type UserId = string;

export type Media = {
  public_id: string;
  timestamp: number;
  url: string;
};

export type MealSummary = {
  id: MealId;
  name: string;
  description: string;
  price: string | number;
  original_price?: string | number;
  is_available: boolean;
  rating: string | number;
  likes: number;
  kitchen_id: KitchenId;
  cover_image: Media | null;
  created_at: string;
  updated_at: string | null;
  deleted_at?: string | null;
};

export type OrderItem = {
  meal: MealSummary;
  meal_id: MealId;
  price: string | number;
  quantity: number;
  id?: OrderItemId;
};

export type CitySummary = {
  id: string;
  name: string;
  state: string;
  created_at: string;
  updated_at: string | null;
};

export type KitchenSummary = {
  id: KitchenId;
  name: string;
  address: string;
  phone_number: string;
  type: string;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  rating: string | number;
  likes: number;
  is_available: boolean;
  owner_id: UserId;
  cover_image: string | null;
  city_id: string | null;
  city?: CitySummary;
  created_at: string;
  updated_at: string | null;
};

export type OwnerSummary = {
  id: UserId;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

export type PaymentMethod = "ONLINE" | "WALLET";

export type OrderStatus =
  | "PENDING"
  | "AWAITING_ACKNOWLEDGEMENT"
  | "PREPARING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type Order = {
  id: OrderId;
  created_at: string;
  updated_at: string | null;

  delivery_address: string;
  delivery_date: string | null;
  dispatch_rider_note: string | null;

  kitchen_id: KitchenId;
  kitchen: KitchenSummary;

  owner_id: UserId;
  owner: OwnerSummary;

  payment_method: PaymentMethod;
  status: OrderStatus;

  items: OrderItem[];

  sub_total: string | number;
  total: string | number;
  service_fee?: string | number;
  delivery_fee?: string | number;
};

export type OrdersQuery = {
  page?: number;
  per_page?: number;
  status?: OrderStatus;
  kitchen_id?: KitchenId;
};

export type OrdersListResponse = {
  items: Order[];
  meta: { page: number; per_page: number; total: number };
};

export type OrdersStatus = "idle" | "loading" | "succeeded" | "failed";

export type PayOrderPayload = { id: OrderId; with: PaymentMethod };
export type PayOrderResult =
  | { id: OrderId; with: "ONLINE"; url: string }
  | { id: OrderId; with: "WALLET"; message: string };

export type UpdateOrderItemStatusPayload = {
  orderId: OrderId;
  itemId: OrderItemId;
  status: "PREPARING" | "IN_TRANSIT" | "DELIVERED";
  as_kitchen?: boolean;
};

export type OrdersState = {
  entities: Record<OrderId, Order>;

  lastListIds: OrderId[];
  lastListMeta: { page: number; per_page: number; total: number } | null;
  lastListQuery: OrdersQuery | null;

  listStatus: OrdersStatus;
  byIdStatus: Record<OrderId, OrdersStatus>;
  payStatus: Record<OrderId, OrdersStatus>;
  updateItemStatus: Record<OrderItemId, OrdersStatus>;

  error: string | null;
};
