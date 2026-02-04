import type { Ad } from "@/redux/ads/ads.types";
import type {
  AnalyticsItem,
  DashboardInfo,
} from "@/redux/dashboard/dashboard.types";
import type { Kitchen, KitchenCity } from "@/redux/kitchen/kitchen.types";
import type { Order, OrderItem } from "@/redux/orders/orders.types";
import type { Transaction } from "@/redux/transactions/transactions.types";
import type { Bank, WalletProfile } from "@/redux/wallet/wallet.types";
import type { User } from "@/redux/users/users.types";

const now = new Date().toISOString();

export const mockUser: User = {
  id: "user-1",
  email: "hello@foodhut.app",
  phone_number: "+2347000000000",
  is_verified: true,
  first_name: "Food",
  last_name: "Lover",
  has_kitchen: false,
  has_rider: false,
  role: "user",
  birthday: null,
  referral_code: null,
  profile_picture: {
    url: "",
  },
  created_at: now,
  updated_at: null,
};

export const mockKitchenCities: KitchenCity[] = [
  {
    id: "city-1",
    name: "Lagos",
    state: "NG",
    created_at: now,
    updated_at: null,
  },
  {
    id: "city-2",
    name: "Abuja",
    state: "NG",
    created_at: now,
    updated_at: null,
  },
  {
    id: "city-3",
    name: "Ibadan",
    state: "NG",
    created_at: now,
    updated_at: null,
  },
];

export const mockKitchenTypes = [
  "Local",
  "Grill",
  "Bakery",
  "Cafe",
  "Fast Food",
  "Seafood",
  "Vegan",
  "Pizza",
  "Dessert",
  "Breakfast",
];

export const mockKitchens: Kitchen[] = [
  {
    id: "kitchen-1",
    name: "Mama Ada Kitchen",
    address: "12 Market Street",
    phone_number: "+2347012345678",
    type: "Local",
    opening_time: "08:00",
    closing_time: "20:00",
    delivery_time: "25-35 mins",
    preparation_time: "20-30 mins",
    is_available: true,
    likes: 124,
    rating: 4.6,
    owner_id: "owner-1",
    cover_image: { url: null },
    city_id: "city-1",
    city: mockKitchenCities[0],
    created_at: now,
    updated_at: null,
  },
  {
    id: "kitchen-2",
    name: "Grill Hub",
    address: "45 Sunrise Avenue",
    phone_number: "+2347087654321",
    type: "Grill",
    opening_time: "10:00",
    closing_time: "22:00",
    delivery_time: "30-40 mins",
    preparation_time: "25-35 mins",
    is_available: true,
    likes: 89,
    rating: 4.2,
    owner_id: "owner-2",
    cover_image: { url: null },
    city_id: "city-2",
    city: mockKitchenCities[1],
    created_at: now,
    updated_at: null,
  },
  {
    id: "kitchen-3",
    name: "Golden Crust",
    address: "7 Baker Road",
    phone_number: "+2347099911223",
    type: "Bakery",
    opening_time: "07:00",
    closing_time: "19:00",
    delivery_time: "20-30 mins",
    preparation_time: "15-25 mins",
    is_available: false,
    likes: 57,
    rating: 4.0,
    owner_id: "owner-3",
    cover_image: { url: null },
    city_id: "city-3",
    city: mockKitchenCities[2],
    created_at: now,
    updated_at: null,
  },
  {
    id: "kitchen-4",
    name: "Cafe Bloom",
    address: "18 Garden Lane",
    phone_number: "+2347001122334",
    type: "Cafe",
    opening_time: "09:00",
    closing_time: "18:00",
    delivery_time: "25-35 mins",
    preparation_time: "15-20 mins",
    is_available: true,
    likes: 143,
    rating: 4.8,
    owner_id: "owner-4",
    cover_image: { url: null },
    city_id: "city-1",
    city: mockKitchenCities[0],
    created_at: now,
    updated_at: null,
  },
];

export type MockMeal = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  is_available: boolean;
  rating: string | number;
  likes: number;
  kitchen_id: string;
  cover_image?: { url: string } | null;
};

export const mockMeals: MockMeal[] = [
  {
    id: "meal-1",
    name: "Jollof Rice",
    description: "Smoky party jollof with chicken",
    price: 2500,
    is_available: true,
    rating: 4.7,
    likes: 80,
    kitchen_id: "kitchen-1",
    cover_image: null,
  },
  {
    id: "meal-2",
    name: "Grilled Suya",
    description: "Spicy beef skewers",
    price: 3200,
    is_available: true,
    rating: 4.5,
    likes: 52,
    kitchen_id: "kitchen-2",
    cover_image: null,
  },
  {
    id: "meal-3",
    name: "Butter Croissant",
    description: "Flaky and warm",
    price: 1200,
    is_available: true,
    rating: 4.3,
    likes: 38,
    kitchen_id: "kitchen-3",
    cover_image: null,
  },
  {
    id: "meal-4",
    name: "Iced Latte",
    description: "Smooth and creamy",
    price: 1800,
    is_available: true,
    rating: 4.6,
    likes: 65,
    kitchen_id: "kitchen-4",
    cover_image: null,
  },
  {
    id: "meal-5",
    name: "Pepper Soup",
    description: "Spicy goat meat pepper soup",
    price: 2800,
    is_available: true,
    rating: 4.4,
    likes: 44,
    kitchen_id: "kitchen-1",
    cover_image: null,
  },
  {
    id: "meal-6",
    name: "Chicken Shawarma",
    description: "Toasted wrap with garlic sauce",
    price: 2200,
    is_available: true,
    rating: 4.5,
    likes: 58,
    kitchen_id: "kitchen-2",
    cover_image: null,
  },
];

export const mockAds: Ad[] = [
  {
    id: "ad-1",
    link: "https://foodhut.app/seasonal",
    duration: 8,
    banner_image: null,
    created_at: now,
    updated_at: null,
  },
  {
    id: "ad-2",
    link: "https://foodhut.app/refer",
    duration: 10,
    banner_image: null,
    created_at: now,
    updated_at: null,
  },
  {
    id: "ad-3",
    link: "https://foodhut.app/kitchen",
    duration: 12,
    banner_image: null,
    created_at: now,
    updated_at: null,
  },
];

export type MockReview = {
  id: string;
  target_type: "meal" | "kitchen";
  target_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export const mockReviews: MockReview[] = [
  {
    id: "review-1",
    target_type: "kitchen",
    target_id: "kitchen-1",
    user_name: "Aisha",
    rating: 4.6,
    comment: "Fast delivery and tasty jollof.",
    created_at: now,
  },
  {
    id: "review-2",
    target_type: "kitchen",
    target_id: "kitchen-2",
    user_name: "Tobi",
    rating: 4.2,
    comment: "Grill was good, portion could be bigger.",
    created_at: now,
  },
  {
    id: "review-3",
    target_type: "meal",
    target_id: "meal-1",
    user_name: "Nneka",
    rating: 4.8,
    comment: "Perfect smoky flavor.",
    created_at: now,
  },
  {
    id: "review-4",
    target_type: "meal",
    target_id: "meal-4",
    user_name: "Jide",
    rating: 4.4,
    comment: "Smooth and refreshing.",
    created_at: now,
  },
];

export const mockBanks: Bank[] = [
  { id: "bank-1", name: "Access Bank", code: "044", created_at: now, updated_at: null },
  { id: "bank-2", name: "GTBank", code: "058", created_at: now, updated_at: null },
  { id: "bank-3", name: "Zenith Bank", code: "057", created_at: now, updated_at: null },
];

export const mockWalletProfile: WalletProfile = {
  id: "wallet-1",
  owner_id: mockUser.id,
  balance: "24500",
  metadata: { backend: { customer: { id: "cust-1", code: "C-1001" } } },
  created_at: now,
  updated_at: null,
};

export const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    amount: "5200",
    direction: "INCOMING",
    note: "Order payment",
    user_id: mockUser.id,
    created_at: now,
    updated_at: null,
  },
  {
    id: "txn-2",
    amount: "1200",
    direction: "OUTGOING",
    note: "Delivery payout",
    user_id: mockUser.id,
    created_at: now,
    updated_at: null,
  },
];

const makeOrderItems = (mealIds: string[]): OrderItem[] =>
  mealIds.map((id, idx) => {
    const meal = mockMeals.find((m) => m.id === id)!;
    return {
      id: `order-item-${id}-${idx}`,
      meal_id: meal.id,
      meal: {
        id: meal.id,
        name: meal.name,
        description: meal.description,
        price: meal.price,
        original_price: meal.original_price,
        is_available: meal.is_available,
        rating: meal.rating,
        likes: meal.likes,
        kitchen_id: meal.kitchen_id,
        cover_image: meal.cover_image
          ? {
              public_id: "mock",
              timestamp: Date.now(),
              url: meal.cover_image.url,
            }
          : null,
        created_at: now,
        updated_at: null,
      },
      price: meal.price,
      quantity: 1,
    };
  });

export const mockOrders: Order[] = [
  {
    id: "order-1",
    created_at: now,
    updated_at: null,
    delivery_address: "12 Market Street",
    delivery_date: null,
    dispatch_rider_note: "Call on arrival",
    kitchen_id: mockKitchens[0].id,
    kitchen: {
      id: mockKitchens[0].id,
      name: mockKitchens[0].name,
      address: mockKitchens[0].address,
      phone_number: mockKitchens[0].phone_number,
      type: mockKitchens[0].type ?? "Local",
      opening_time: mockKitchens[0].opening_time ?? "08:00",
      closing_time: mockKitchens[0].closing_time ?? "20:00",
      delivery_time: mockKitchens[0].delivery_time ?? "25-35 mins",
      preparation_time: mockKitchens[0].preparation_time ?? "20-30 mins",
      rating: mockKitchens[0].rating ?? 4.5,
      likes: mockKitchens[0].likes ?? 0,
      is_available: mockKitchens[0].is_available,
      owner_id: mockKitchens[0].owner_id,
      cover_image: mockKitchens[0].cover_image?.url ?? null,
      city_id: mockKitchens[0].city_id,
      city: mockKitchens[0].city
        ? {
            id: mockKitchens[0].city!.id,
            name: mockKitchens[0].city!.name,
            state: mockKitchens[0].city!.state,
            created_at: now,
            updated_at: null,
          }
        : undefined,
      created_at: now,
      updated_at: null,
    },
    owner_id: mockUser.id,
    owner: {
      id: mockUser.id,
      email: mockUser.email,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      phone_number: mockUser.phone_number,
    },
    payment_method: "ONLINE",
    status: "DELIVERED",
    items: makeOrderItems(["meal-1", "meal-5"]),
    sub_total: 5300,
    total: 5300,
  },
  {
    id: "order-2",
    created_at: now,
    updated_at: null,
    delivery_address: "45 Sunrise Avenue",
    delivery_date: null,
    dispatch_rider_note: "Leave at gate",
    kitchen_id: mockKitchens[1].id,
    kitchen: {
      id: mockKitchens[1].id,
      name: mockKitchens[1].name,
      address: mockKitchens[1].address,
      phone_number: mockKitchens[1].phone_number,
      type: mockKitchens[1].type ?? "Grill",
      opening_time: mockKitchens[1].opening_time ?? "10:00",
      closing_time: mockKitchens[1].closing_time ?? "22:00",
      delivery_time: mockKitchens[1].delivery_time ?? "30-40 mins",
      preparation_time: mockKitchens[1].preparation_time ?? "25-35 mins",
      rating: mockKitchens[1].rating ?? 4.2,
      likes: mockKitchens[1].likes ?? 0,
      is_available: mockKitchens[1].is_available,
      owner_id: mockKitchens[1].owner_id,
      cover_image: mockKitchens[1].cover_image?.url ?? null,
      city_id: mockKitchens[1].city_id,
      city: mockKitchens[1].city
        ? {
            id: mockKitchens[1].city!.id,
            name: mockKitchens[1].city!.name,
            state: mockKitchens[1].city!.state,
            created_at: now,
            updated_at: null,
          }
        : undefined,
      created_at: now,
      updated_at: null,
    },
    owner_id: mockUser.id,
    owner: {
      id: mockUser.id,
      email: mockUser.email,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      phone_number: mockUser.phone_number,
    },
    payment_method: "ONLINE",
    status: "AWAITING_PAYMENT",
    items: makeOrderItems(["meal-2", "meal-6"]),
    sub_total: 5400,
    total: 5400,
  },
];

export const mockDashboardInfo: DashboardInfo = {
  kitchens: 12,
  meals: 86,
  orders: 340,
  transactions: 124,
};

export const mockAnalyticsItems: AnalyticsItem[] = [
  {
    id: "analytics-1",
    amount: "5200",
    created_at: now,
    updated_at: null,
    direction: "INCOMING",
    ref: "ORDER-123",
    note: "Order payment",
    user_id: "user-1",
    wallet_id: "wallet-1",
    purpose: { type: "ORDER", order_id: "order-123" },
  },
  {
    id: "analytics-2",
    amount: "1500",
    created_at: now,
    updated_at: null,
    direction: "OUTGOING",
    ref: "PAYOUT-44",
    note: "Vendor payout",
    user_id: "user-2",
    wallet_id: "wallet-2",
    purpose: { type: "ORDER", order_id: "order-120" },
  },
  {
    id: "analytics-3",
    amount: "3000",
    created_at: now,
    updated_at: null,
    direction: "INCOMING",
    ref: "ORDER-140",
    note: "Order payment",
    user_id: "user-3",
    wallet_id: "wallet-3",
    purpose: { type: "ORDER", order_id: "order-140" },
  },
];
