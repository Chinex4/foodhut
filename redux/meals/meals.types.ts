export type MealId = string;

export type Media = {
  id?: string;
  url: string;
};

export type MealDiscount =
  | {
      start_date: number;
      end_date: number;
      percentage: number;
    }
  | {
      start_date: number;
      end_date: number;
      price: number;
    }
  | null;

export type Meal = {
  id: MealId;
  name: string;
  description: string;
  price: string | number;
  original_price?: string | number;
  is_available: boolean;
  in_cart?: boolean;
  likes: number;
  rating: string | number;
  kitchen_id: string;
  cover_image_id?: string;
  cover_image: Media | null;
  discount?: MealDiscount;
  created_at: number | string;
  updated_at: number | string | null;
  is_liked?: boolean;
};

export type MealsQuery = {
  page?: number;
  per_page?: number;
  kitchen_id?: string;
  search?: string;
  is_liked?: boolean;
};

export type MealsListResponse = {
  items: Meal[];
  meta: { page: number; per_page: number; total: number };
};

export type CreateMealPayload = {
  name: string;
  description: string;
  price: string | number;
  cover_image_id?: string;
  cover?: { uri: string; name?: string; type?: string } | null;
};

export type UpdateMealPayload = Partial<{
  name: string;
  description: string;
  price: string | number;
  is_available: boolean;
  cover_image_id: string;
  cover: { uri: string; name?: string; type?: string } | null;
}>;

export type MealsStatus = "idle" | "loading" | "succeeded" | "failed";

export type MealsState = {
  entities: Record<MealId, Meal>;

  lastListIds: MealId[];
  lastListMeta: { page: number; per_page: number; total: number } | null;
  lastListQuery: MealsQuery | null;

  listStatus: MealsStatus;
  createStatus: MealsStatus;
  byIdStatus: Record<MealId, MealsStatus>;
  updateByIdStatus: Record<MealId, MealsStatus>;
  deleteByIdStatus: Record<MealId, MealsStatus>;
  likeStatus: Record<MealId, MealsStatus>;

  error: string | null;
};
