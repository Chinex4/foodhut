export type KitchenId = string;
export type CityId = string;

export type KitchenCity = {
  id: CityId;
  name: string;
  state: string;
  created_at: string;
  updated_at: string | null;
};

export type Kitchen = {
  id: KitchenId;
  name: string;
  address: string;
  phone_number: string;
  type: string;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  is_available: boolean;
  likes: number;
  rating: string | number;
  owner_id: string;
  cover_image: string | null;

  city_id: CityId | null;
  city?: KitchenCity;

  created_at: string;
  updated_at: string | null;
};

export type CreateKitchenPayload = {
  name: string;
  address: string;
  phone_number: string;
  type: string;
  opening_time: string;
  closing_time: string;
  delivery_time: string;
  preparation_time: string;
  city_id?: CityId;
};

export type UpdateKitchenPayload = Partial<
  Pick<
    Kitchen,
    | "name"
    | "address"
    | "phone_number"
    | "type"
    | "opening_time"
    | "closing_time"
    | "delivery_time"
    | "preparation_time"
    | "is_available"
    | "city_id"
  >
>;

export type CreateCityPayload = {
  name: string;
  state: string;
};

export type KitchensQuery = {
  page?: number;
  per_page?: number;
  is_available?: boolean;
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
