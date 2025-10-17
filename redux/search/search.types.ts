// redux/search/search.types.ts

export type Media = {
  public_id: string;
  timestamp: number;
  url: string;
};

export type SearchKind = "meal" | "kitchen";

export type SearchMeal = {
  kind: "meal";
  id: string;
  name: string;
  description: string;
  price: string | number;
  original_price?: string | number;
  rating: string | number;
  likes: number;
  is_available: boolean;
  kitchen_id: string;
  cover_image: Media | null;
  created_at: string;
  updated_at: string | null;
  deleted_at?: string | null;
};

export type CitySummary = {
  id: string;
  name: string;
  state: string;
  created_at: string;
  updated_at: string | null;
};

export type SearchKitchen = {
  kind: "kitchen";
  id: string;
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

export type RawSearchItem = any;
export type SearchItem = SearchMeal | SearchKitchen;

export type SearchQuery = {
  q: string;
  page?: number;
  per_page?: number;
};

export type SearchListResponse = {
  items: RawSearchItem[];
  meta: { page: number; per_page: number; total: number };
};

export type SearchStatus = "idle" | "loading" | "succeeded" | "failed";

export type SearchState = {
  items: SearchItem[];
  meta: { page: number; per_page: number; total: number } | null;
  query: SearchQuery | null;
  status: SearchStatus;
  error: string | null;
};
