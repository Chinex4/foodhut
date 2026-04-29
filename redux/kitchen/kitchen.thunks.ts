import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { boolToQueryString, compactQuery, getApiErrorMessage } from "@/api/http";
import { getMediaUrl, uploadSingleMedia } from "@/api/storage";
import type {
  CreateCityPayload,
  CreateKitchenPayload,
  Kitchen,
  KitchenCity,
  KitchensListResponse,
  KitchensQuery,
  UpdateKitchenPayload,
  UpdateKitchenProfilePayload,
} from "./kitchen.types";

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
  city: KitchenCity;
  owner_id: string;
  is_available: boolean;
  is_blocked: boolean;
  is_verified: boolean;
  likes: number;
  rating: number;
  profile_picture_id: string | null;
  cover_image_id: string | null;
  profile_picture?: {
    id: string;
    url?: string | null;
    meta?: Record<string, string | null | undefined> | null;
  } | null;
  cover_image?: {
    id: string;
    url?: string | null;
    meta?: Record<string, string | null | undefined> | null;
  } | null;
  created_at: number;
  updated_at: number | null;
};

type FetchKitchenListResponse = {
  items: BackendKitchen[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

const toKitchen = (k: BackendKitchen): Kitchen => ({
  id: k.id,
  name: k.name,
  address: k.address,
  phone_number: k.phone_number,
  type: k.type,
  opening_time: k.opening_time,
  closing_time: k.closing_time,
  delivery_time: k.delivery_time,
  preparation_time: k.preparation_time,
  is_available: k.is_available,
  is_blocked: k.is_blocked,
  is_verified: k.is_verified,
  likes: k.likes,
  rating: k.rating,
  owner_id: k.owner_id,
  profile_picture_id: k.profile_picture_id,
  cover_image_id: k.cover_image_id,
  profile_picture: {
    url: getMediaUrl(k.profile_picture, k.profile_picture_id),
  },
  cover_image: {
    url: getMediaUrl(k.cover_image, k.cover_image_id),
  },
  city_id: k.city_id,
  city: k.city,
  created_at: k.created_at,
  updated_at: k.updated_at,
});

const fetchCityById = async (cityId?: string): Promise<KitchenCity | undefined> => {
  if (!cityId) return undefined;
  const { data } = await api.get<KitchenCity[]>("/kitchens/cities");
  return data.find((city) => city.id === cityId);
};

export const createKitchen = createAsyncThunk<
  { message: string },
  CreateKitchenPayload,
  { rejectValue: string }
>("kitchen/createKitchen", async (body, { rejectWithValue }) => {
  try {
    const city = body.city ?? (await fetchCityById(body.city_id));
    if (!city || !body.city_id) {
      return rejectWithValue("Please select a valid city");
    }

    await api.post("/kitchens", {
      name: body.name,
      address: body.address,
      phone_number: body.phone_number,
      type: body.type,
      opening_time: body.opening_time,
      closing_time: body.closing_time,
      delivery_time: body.delivery_time,
      preparation_time: body.preparation_time,
      city_id: body.city_id,
      city,
      profile_picture_id: body.profile_picture_id ?? null,
      cover_image_id: body.cover_image_id ?? null,
    });

    return { message: "Kitchen created!" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create kitchen"));
  }
});

export const fetchKitchens = createAsyncThunk<
  KitchensListResponse,
  KitchensQuery | undefined,
  { rejectValue: string }
>("kitchen/fetchKitchens", async (query, { rejectWithValue }) => {
  try {
    const params = compactQuery({
      page: query?.page,
      per_page: query?.per_page,
      type: query?.type,
      is_available: boolToQueryString(query?.is_available ?? true),
      search: query?.search,
      city_id: query?.city_id,
    });

    const { data } = await api.get<FetchKitchenListResponse>("/kitchens", { params });

    return {
      items: (data.items ?? []).map(toKitchen),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch kitchens"));
  }
});

export const fetchKitchenTypes = createAsyncThunk<string[], void, { rejectValue: string }>(
  "kitchen/fetchKitchenTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<string[]>("/kitchens/types");
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch kitchen types"));
    }
  }
);

export const fetchKitchenCities = createAsyncThunk<KitchenCity[], void, { rejectValue: string }>(
  "kitchen/fetchKitchenCities",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<KitchenCity[]>("/kitchens/cities");
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch cities"));
    }
  }
);

export const createKitchenCity = createAsyncThunk<
  { message: string },
  CreateCityPayload,
  { rejectValue: string }
>("kitchen/createKitchenCity", async (body, { rejectWithValue }) => {
  try {
    await api.post("/kitchens/cities", body);
    return { message: "City created" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create city"));
  }
});

export const fetchKitchenById = createAsyncThunk<Kitchen, string, { rejectValue: string }>(
  "kitchen/fetchKitchenById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendKitchen>(`/kitchens/${id}`);
      return toKitchen(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch kitchen"));
    }
  }
);

export const fetchKitchenProfile = createAsyncThunk<Kitchen, void, { rejectValue: string }>(
  "kitchen/fetchKitchenProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendKitchen>("/kitchens/profile");
      return toKitchen(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch your kitchen"));
    }
  }
);

export const updateKitchenById = createAsyncThunk<
  { message: string; id: string },
  { id: string; body: UpdateKitchenPayload },
  { rejectValue: string }
>("kitchen/updateKitchenById", async ({ id, body }, { rejectWithValue }) => {
  try {
    await api.patch(`/kitchens/${id}`, {
      opening_time: body.opening_time,
      is_available: body.is_available,
      profile_picture_id: body.profile_picture_id,
      cover_image_id: body.cover_image_id,
    });

    return { message: "Kitchen updated successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update kitchen"));
  }
});

export const updateKitchenByProfile = createAsyncThunk<
  { message: string; kitchen: Kitchen },
  UpdateKitchenProfilePayload,
  { rejectValue: string }
>("kitchen/updateKitchenByProfile", async (body, { dispatch, rejectWithValue }) => {
  try {
    await api.patch("/kitchens/profile", body);
    const kitchen = await dispatch(fetchKitchenProfile()).unwrap();

    return { message: "Kitchen updated successfully", kitchen };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update your kitchen"));
  }
});

export const uploadKitchenCoverByProfile = createAsyncThunk<
  { message: string; kitchen: Kitchen },
  { uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverByProfile",
  async ({ uri, name, type }, { dispatch, rejectWithValue }) => {
    try {
      const uploaded = await uploadSingleMedia({ uri, name, type });
      if (!uploaded?.id) {
        return rejectWithValue("Failed to upload cover image");
      }

      await api.patch("/kitchens/profile", {
        cover_image_id: uploaded.id,
      });

      const kitchen = await dispatch(fetchKitchenProfile()).unwrap();
      return {
        message: "Profile picture updated successfully",
        kitchen,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to upload cover image"));
    }
  }
);

export const uploadKitchenCoverById = createAsyncThunk<
  { message: string; id: string; kitchen: Kitchen },
  { id: string; uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverById",
  async ({ id, uri, name, type }, { dispatch, rejectWithValue }) => {
    try {
      const uploaded = await uploadSingleMedia({ uri, name, type });
      if (!uploaded?.id) {
        return rejectWithValue("Failed to upload cover image");
      }

      await api.patch(`/kitchens/${id}`, {
        cover_image_id: uploaded.id,
      });

      const kitchen = await dispatch(fetchKitchenById(id)).unwrap();
      return {
        message: "Profile picture updated successfully",
        id,
        kitchen,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to upload cover image"));
    }
  }
);

export const likeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/likeKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/like`);
    return { message: "Kitchen liked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to like kitchen"));
  }
});

export const unlikeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unlikeKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/unlike`);
    return { message: "Kitchen unliked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to unlike kitchen"));
  }
});

export const blockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/blockKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/block`);
    return { message: "Kitchen blocked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to block kitchen"));
  }
});

export const unblockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unblockKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/unblock`);
    return { message: "Kitchen unblocked successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to unblock kitchen"));
  }
});

export const verifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/verifyKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/verify`);
    return { message: "Kitchen verified successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to verify kitchen"));
  }
});

export const unverifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unverifyKitchen", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/kitchens/${id}/unverify`);
    return { message: "Kitchen unverified successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to unverify kitchen"));
  }
});
