export type KitchenId = string;
export type CityId = string;

export type KitchenType = "Chinese" | "Cuisine" | "Fast Food" | "Local" | string;

export type KitchenCity = {
  id: CityId;
  name: string;
  state: string;
  created_at: number | string;
  updated_at: number | string | null;
};

export type Kitchen = {
  id: KitchenId;
  name: string;
  address: string;
  phone_number: string;
  type: KitchenType;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  is_available: boolean;
  is_blocked?: boolean;
  is_verified?: boolean;
  likes: number;
  rating: string | number;
  owner_id: string;

  profile_picture_id?: string | null;
  cover_image_id?: string | null;
  profile_picture?: { url: string | null } | null;
  cover_image: { url: string | null };

  city_id: CityId | null;
  city?: KitchenCity;

  created_at: number | string;
  updated_at: number | string | null;
};

export type CreateKitchenPayload = {
  name: string;
  address: string;
  phone_number: string;
  type: KitchenType;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  city_id?: CityId;
  city?: KitchenCity;
  profile_picture_id?: string | null;
  cover_image_id?: string | null;
};

export type UpdateKitchenPayload = Partial<{
  name: string;
  address: string;
  phone_number: string;
  type: KitchenType;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  is_available: boolean;
  city_id: CityId | null;
  profile_picture_id: string;
  cover_image_id: string;
}>;

export type CreateCityPayload = {
  name: string;
  state: string;
};

export type KitchensQuery = {
  page?: number;
  per_page?: number;
  type?: KitchenType;
  is_available?: boolean;
  search?: string;
};

export type KitchensListResponse = {
  items: Kitchen[];
  meta: { page: number; per_page: number; total: number };
};

export type KitchensStatus = "idle" | "loading" | "succeeded" | "failed";

export type KitchensState = {
  entities: Record<KitchenId, Kitchen>;
  cities: KitchenCity[];
  types: string[];
  lastListIds: KitchenId[];
  lastListMeta: { page: number; per_page: number; total: number } | null;
  lastListQuery: KitchensQuery | null;
  profileId: KitchenId | null;
  listStatus: KitchensStatus;
  profileStatus: KitchensStatus;
  byIdStatus: Record<KitchenId, KitchensStatus>;
  createStatus: KitchensStatus;
  updateByIdStatus: Record<KitchenId, KitchensStatus>;
  updateProfileStatus: KitchensStatus;
  uploadCoverByIdStatus: Record<KitchenId, KitchensStatus>;
  uploadCoverProfileStatus: KitchensStatus;
  likeStatus: Record<KitchenId, KitchensStatus>;
  blockStatus: Record<KitchenId, KitchensStatus>;
  verifyStatus: Record<KitchenId, KitchensStatus>;

  citiesStatus: KitchensStatus;
  cityCreateStatus: KitchensStatus;
  typesStatus: KitchensStatus;

  error: string | null;
};
