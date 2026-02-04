export type VendorMeal = {
  id: string;
  name: string;
  description: string;
  price: string;
  portion: string;
  available: boolean;
  stock: number;
  discountPercent?: number;
};

export type VendorOrder = {
  id: string;
  customer: string;
  items: { name: string; qty: number }[];
  total: string;
  status: "INCOMING" | "ONGOING" | "COMPLETED";
  time: string;
};

export type VendorOutlet = {
  id: string;
  name: string;
  address: string;
  active: boolean;
};

export type VendorReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export const mockVendorSummary = {
  today: "₦ 54,200",
  yesterday: "₦ 41,350",
  last14: "₦ 488,900",
  last30: "₦ 1,102,200",
  wallet: "₦ 230,500",
};

export const mockVendorMeals: VendorMeal[] = [
  {
    id: "meal-1",
    name: "Jollof Rice",
    description: "Smoky party jollof with chicken",
    price: "₦ 2,500",
    portion: "Regular",
    available: true,
    stock: 18,
    discountPercent: 10,
  },
  {
    id: "meal-2",
    name: "Grilled Suya",
    description: "Spicy beef skewers",
    price: "₦ 3,200",
    portion: "Large",
    available: true,
    stock: 9,
  },
  {
    id: "meal-3",
    name: "Butter Croissant",
    description: "Flaky and warm",
    price: "₦ 1,200",
    portion: "Single",
    available: false,
    stock: 0,
  },
];

export const mockVendorOrders: VendorOrder[] = [
  {
    id: "ORD-1001",
    customer: "Nneka A.",
    items: [
      { name: "Jollof Rice", qty: 1 },
      { name: "Iced Latte", qty: 2 },
    ],
    total: "₦ 6,100",
    status: "INCOMING",
    time: "12 mins ago",
  },
  {
    id: "ORD-1002",
    customer: "Tobi K.",
    items: [{ name: "Grilled Suya", qty: 1 }],
    total: "₦ 3,200",
    status: "ONGOING",
    time: "25 mins ago",
  },
  {
    id: "ORD-0998",
    customer: "Maya I.",
    items: [{ name: "Butter Croissant", qty: 3 }],
    total: "₦ 3,600",
    status: "COMPLETED",
    time: "Yesterday",
  },
];

export const mockVendorOutlets: VendorOutlet[] = [
  {
    id: "outlet-1",
    name: "Main Branch",
    address: "12 Market Street, Lagos",
    active: true,
  },
  {
    id: "outlet-2",
    name: "VI Pickup",
    address: "22 Adeola Odeku, Lagos",
    active: false,
  },
];

export const mockVendorReviews: VendorReview[] = [
  {
    id: "vr-1",
    name: "Aisha",
    rating: 5,
    comment: "Food was amazing and arrived hot.",
    date: "Today",
  },
  {
    id: "vr-2",
    name: "Kunle",
    rating: 4,
    comment: "Great taste, quick pickup.",
    date: "2 days ago",
  },
];
