export type KitchenId = string;
export type MealId = string;

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
  in_cart?: boolean;
  likes: number;
  rating: string | number;
  kitchen_id: KitchenId;
  cover_image: Media | null;
  created_at: string;
  updated_at: string | null;
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
  owner_id: string;
  cover_image: string | null;
  city_id: string | null;
  city?: CitySummary;
  created_at: string;
  updated_at: string | null;
};

export type CartMeal = {
  meal: MealSummary;
  quantity: number;
};

export type CartKitchenGroup = {
  kitchen: KitchenSummary;
  meals: CartMeal[];
};

export type ActiveCartResponse = CartKitchenGroup[];

export type CartStatus = "idle" | "loading" | "succeeded" | "failed";

export type CartState = {
  kitchenIds: KitchenId[];
  byKitchenId: Record<
    KitchenId,
    {
      kitchen: KitchenSummary;
      items: Record<MealId, CartMeal>;
      itemOrder: MealId[];
    }
  >;

  fetchStatus: CartStatus;
  setItemStatus: Record<MealId, CartStatus>;
  removeItemStatus: Record<MealId, CartStatus>;
  clearKitchenStatus: Record<KitchenId, CartStatus>;
  checkoutStatus: CartStatus;

  error: string | null;
};

export type SetCartItemPayload = {
  mealId: MealId;
  quantity: number;
};

export type CheckoutPayload = {
  kitchen_id: string;
  payment_method: "WALLET" | "ONLINE" | string;
  dispatch_rider_note: string;
  delivery_address: string;
  delivery_date?: number;
};

export type CheckoutResult = {
  id: string;
  message: string; 
};
