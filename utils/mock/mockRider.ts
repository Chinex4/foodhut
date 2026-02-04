export type RiderJobStatus =
  | "AVAILABLE"
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED";

export type RiderJob = {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  eta: string;
  customerName: string;
  customerPhone: string;
  fare: string;
  note?: string;
  status: RiderJobStatus;
};

export type RiderHistory = {
  id: string;
  date: string;
  pickup: string;
  dropoff: string;
  amount: string;
  status: "completed" | "cancelled";
};

export type RiderReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type RiderProfile = {
  name: string;
  phone: string;
  email: string;
  city: string;
  avatar?: string | null;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

export const mockRiderProfile: RiderProfile = {
  name: "Prosper Chichi",
  phone: "+234 809 260 4955",
  email: "rider@foodhut.app",
  city: "Lagos",
  avatar: null,
  kycStatus: "PENDING",
};

export const mockRiderWallet = {
  balance: "₦ 45,500",
  dailyCash: "₦ 8,200",
  todayTrips: 6,
  todayHours: "4h 20m",
};

export const mockRiderJobs: RiderJob[] = [
  {
    id: "FH-237895",
    pickup: "Food Hut - Ikoyi",
    dropoff: "12, Kaduri street, Lagos",
    distance: "4.2 km",
    eta: "18 mins",
    customerName: "Faith A.",
    customerPhone: "+234 809 260 4955",
    fare: "₦2,500",
    note: "Leave at reception if I’m not home.",
    status: "AVAILABLE",
  },
  {
    id: "FH-237896",
    pickup: "Mama’s Kitchen - Lekki",
    dropoff: "1, Umu street, Lagos",
    distance: "6.8 km",
    eta: "25 mins",
    customerName: "Kunle O.",
    customerPhone: "+234 701 222 9931",
    fare: "₦3,400",
    status: "AVAILABLE",
  },
  {
    id: "FH-237897",
    pickup: "Urban Eats - VI",
    dropoff: "45, Herbert Macaulay, Lagos",
    distance: "5.5 km",
    eta: "21 mins",
    customerName: "Maya I.",
    customerPhone: "+234 812 334 1001",
    fare: "₦2,900",
    note: "Call when you arrive.",
    status: "AVAILABLE",
  },
];

export const mockRiderHistory: RiderHistory[] = [
  {
    id: "#237895",
    date: "01 Aug 2025, 2:25PM",
    pickup: "12, Kaduri street, Lagos",
    dropoff: "1, Umu street, Lagos",
    amount: "₦3,000.04",
    status: "completed",
  },
  {
    id: "#214578",
    date: "31 Jul 2025, 6:10PM",
    pickup: "2, Adebayo street, Lagos",
    dropoff: "45, Herbert Macaulay, Lagos",
    amount: "₦2,560.00",
    status: "completed",
  },
  {
    id: "#214579",
    date: "30 Jul 2025, 4:00PM",
    pickup: "Shoprite, Lekki, Lagos",
    dropoff: "Phase 1 estate, Lagos",
    amount: "₦4,000.01",
    status: "cancelled",
  },
];

export const mockRiderReviews: RiderReview[] = [
  {
    id: "rr-1",
    name: "Ade Right",
    rating: 5,
    comment: "Polite and fast delivery.",
    date: "Today",
  },
  {
    id: "rr-2",
    name: "Maya I.",
    rating: 4,
    comment: "Arrived on time, kept me updated.",
    date: "2 days ago",
  },
  {
    id: "rr-3",
    name: "Kunle O.",
    rating: 5,
    comment: "Great experience.",
    date: "1 week ago",
  },
];
