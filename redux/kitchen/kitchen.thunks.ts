import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CreateCityPayload,
  CreateKitchenPayload,
  Kitchen,
  KitchenCity,
  KitchensListResponse,
  KitchensQuery,
  UpdateKitchenPayload,
} from "./kitchen.types";
import {
  mockKitchenCities,
  mockKitchenTypes,
  mockKitchens,
} from "@/utils/mockData";

let kitchens: Kitchen[] = [...mockKitchens];
let kitchenCities: KitchenCity[] = [...mockKitchenCities];
let kitchenTypes: string[] = [...mockKitchenTypes];
let profileKitchenId: string | null = kitchens[0]?.id ?? null;

const listKitchens = (query?: KitchensQuery): KitchensListResponse => {
  const page = query?.page ?? 1;
  const perPage = query?.per_page ?? kitchens.length;
  const filtered =
    typeof query?.is_available === "boolean"
      ? kitchens.filter((k) => k.is_available === query.is_available)
      : kitchens;
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  return {
    items,
    meta: {
      page,
      per_page: perPage,
      total: filtered.length,
    },
  };
};

const findKitchen = (id: string) => kitchens.find((k) => k.id === id) || null;

export const createKitchen = createAsyncThunk<
  { message: string },
  CreateKitchenPayload,
  { rejectValue: string }
>("kitchen/createKitchen", async (body, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString();
    const newKitchen: Kitchen = {
      id: `kitchen-${kitchens.length + 1}`,
      name: body.name,
      address: body.address,
      phone_number: body.phone_number,
      type: body.type,
      opening_time: body.opening_time,
      closing_time: body.closing_time,
      delivery_time: body.delivery_time,
      preparation_time: body.preparation_time,
      is_available: true,
      likes: 0,
      rating: 0,
      owner_id: "owner-local",
      cover_image: { url: null },
      city_id: body.city_id ?? null,
      city: body.city_id
        ? kitchenCities.find((c) => c.id === body.city_id) ?? undefined
        : undefined,
      created_at: now,
      updated_at: null,
    };
    kitchens = [newKitchen, ...kitchens];
    if (!profileKitchenId) profileKitchenId = newKitchen.id;
    return { message: "Kitchen created!" };
  } catch (err: any) {
    return rejectWithValue("Failed to create kitchen");
  }
});

export const fetchKitchens = createAsyncThunk<
  KitchensListResponse,
  KitchensQuery | undefined,
  { rejectValue: string }
>("kitchen/fetchKitchens", async (query, { rejectWithValue }) => {
  try {
    return listKitchens(query);
  } catch (err: any) {
    return rejectWithValue("Failed to fetch kitchens");
  }
});

export const fetchKitchenTypes = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenTypes", async (_, { rejectWithValue }) => {
  try {
    return kitchenTypes;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch kitchen types");
  }
});

export const fetchKitchenCities = createAsyncThunk<
  KitchenCity[],
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenCities", async (_, { rejectWithValue }) => {
  try {
    return kitchenCities;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch cities");
  }
});

export const createKitchenCity = createAsyncThunk<
  { message: string },
  CreateCityPayload,
  { rejectValue: string }
>("kitchen/createKitchenCity", async (body, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString();
    const newCity: KitchenCity = {
      id: `city-${kitchenCities.length + 1}`,
      name: body.name,
      state: body.state,
      created_at: now,
      updated_at: null,
    };
    kitchenCities = [...kitchenCities, newCity];
    return { message: "City created" };
  } catch (err: any) {
    return rejectWithValue("Failed to create city");
  }
});

export const fetchKitchenById = createAsyncThunk<
  Kitchen,
  string,
  { rejectValue: string }
>("kitchen/fetchKitchenById", async (id, { rejectWithValue }) => {
  try {
    const kitchen = findKitchen(id);
    if (!kitchen) return rejectWithValue("Failed to fetch kitchen");
    return kitchen;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch kitchen");
  }
});

export const fetchKitchenProfile = createAsyncThunk<
  Kitchen,
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenProfile", async (_, { rejectWithValue }) => {
  try {
    const kitchen = profileKitchenId
      ? findKitchen(profileKitchenId)
      : kitchens[0];
    if (!kitchen) return rejectWithValue("Failed to fetch your kitchen");
    return kitchen;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch your kitchen");
  }
});

export const updateKitchenById = createAsyncThunk<
  { message: string; id: string },
  { id: string; body: UpdateKitchenPayload },
  { rejectValue: string }
>("kitchen/updateKitchenById", async ({ id, body }, { rejectWithValue }) => {
  try {
    kitchens = kitchens.map((k) =>
      k.id === id
        ? {
            ...k,
            ...body,
            updated_at: new Date().toISOString(),
          }
        : k
    );
    return { message: "Kitchen updated successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to update kitchen");
  }
});

export const updateKitchenByProfile = createAsyncThunk<
  { message: string },
  UpdateKitchenPayload,
  { rejectValue: string }
>("kitchen/updateKitchenByProfile", async (body, { rejectWithValue }) => {
  try {
    if (!profileKitchenId) return { message: "Kitchen updated successfully" };
    kitchens = kitchens.map((k) =>
      k.id === profileKitchenId
        ? {
            ...k,
            ...body,
            updated_at: new Date().toISOString(),
          }
        : k
    );
    return { message: "Kitchen updated successfully" };
  } catch (err: any) {
    return rejectWithValue("Failed to update your kitchen");
  }
});

export const uploadKitchenCoverByProfile = createAsyncThunk<
  { message: string; kitchen: Kitchen },
  { uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverByProfile",
  async ({ uri }, { rejectWithValue }) => {
    try {
      if (!profileKitchenId) return rejectWithValue("No kitchen found");
      kitchens = kitchens.map((k) =>
        k.id === profileKitchenId
          ? {
              ...k,
              cover_image: { url: uri },
              updated_at: new Date().toISOString(),
            }
          : k
      );
      const updated = findKitchen(profileKitchenId);
      if (!updated) return rejectWithValue("Failed to upload cover image");
      return {
        message: "Profile picture updated successfully",
        kitchen: updated,
      };
    } catch (err: any) {
      return rejectWithValue("Failed to upload cover image");
    }
  }
);

export const uploadKitchenCoverById = createAsyncThunk<
  { message: string; id: string; kitchen: Kitchen },
  { id: string; uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverById",
  async ({ id, uri }, { rejectWithValue }) => {
    try {
      kitchens = kitchens.map((k) =>
        k.id === id
          ? {
              ...k,
              cover_image: { url: uri },
              updated_at: new Date().toISOString(),
            }
          : k
      );
      const updated = findKitchen(id);
      if (!updated) return rejectWithValue("Failed to upload cover image");
      return {
        message: "Profile picture updated successfully",
        id,
        kitchen: updated,
      };
    } catch (err: any) {
      return rejectWithValue("Failed to upload cover image");
    }
  }
);

export const likeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/likeKitchen", async (id, { rejectWithValue }) => {
  try {
    kitchens = kitchens.map((k) =>
      k.id === id ? { ...k, likes: k.likes + 1 } : k
    );
    return { message: "Kitchen liked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to like kitchen");
  }
});

export const unlikeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unlikeKitchen", async (id, { rejectWithValue }) => {
  try {
    kitchens = kitchens.map((k) =>
      k.id === id ? { ...k, likes: Math.max(0, k.likes - 1) } : k
    );
    return { message: "Kitchen unliked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to unlike kitchen");
  }
});

export const blockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/blockKitchen", async (id, { rejectWithValue }) => {
  try {
    return { message: "Kitchen blocked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to block kitchen");
  }
});

export const unblockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unblockKitchen", async (id, { rejectWithValue }) => {
  try {
    return { message: "Kitchen unblocked successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to unblock kitchen");
  }
});

export const verifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/verifyKitchen", async (id, { rejectWithValue }) => {
  try {
    return { message: "Kitchen verified successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to verify kitchen");
  }
});

export const unverifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unverifyKitchen", async (id, { rejectWithValue }) => {
  try {
    return { message: "Kitchen unverified successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to unverify kitchen");
  }
});
