import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  CreateCityPayload,
  CreateKitchenPayload,
  Kitchen,
  KitchenCity,
  KitchensListResponse,
  KitchensQuery,
  UpdateKitchenPayload,
} from "./kitchen.types";

const BASE = "/kitchens";

const buildQuery = (q?: KitchensQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  if (typeof q.is_available === "boolean")
    p.set("is_available", String(q.is_available));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const createKitchen = createAsyncThunk<
  { message: string },
  CreateKitchenPayload,
  { rejectValue: string }
>("kitchen/createKitchen", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}`, body);
    console.log(res)
    const message = res.data?.message ?? res.data?.data ?? "Kitchen created!";
    return { message };
  } catch (err: any) {
    const payload = err?.response?.data;
    console.log("Create kitchen error:", payload || err);

    const validation = payload?.errors;
    if (validation && typeof validation === "object") {
      const flattened = Object.values(validation)
        .flat()
        .filter(Boolean)
        .join("\n");
      if (flattened) return rejectWithValue(flattened);
    }

    const message =
      payload?.message ||
      payload?.error ||
      err?.message ||
      "Failed to create kitchen";

    return rejectWithValue(message);
  }
});

export const fetchKitchens = createAsyncThunk<
  KitchensListResponse,
  KitchensQuery | undefined,
  { rejectValue: string }
>("kitchen/fetchKitchens", async (query, { rejectWithValue }) => {
  try {
    const url = `${BASE}${buildQuery(query)}`;
    const res = await api.get(url);
    return res.data as KitchensListResponse;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch kitchens"
    );
  }
});

export const fetchKitchenTypes = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenTypes", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/types`);
    return res.data as string[];
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch kitchen types"
    );
  }
});

export const fetchKitchenCities = createAsyncThunk<
  KitchenCity[],
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenCities", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/cities`);
    return res.data as KitchenCity[];
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch cities"
    );
  }
});

export const createKitchenCity = createAsyncThunk<
  { message: string },
  CreateCityPayload,
  { rejectValue: string }
>("kitchen/createKitchenCity", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post(`${BASE}/cities`, body);
    const message = res.data?.message ?? "City created";
    return { message };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to create city"
    );
  }
});

export const fetchKitchenById = createAsyncThunk<
  Kitchen,
  string,
  { rejectValue: string }
>("kitchen/fetchKitchenById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as Kitchen;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch kitchen"
    );
  }
});

export const fetchKitchenProfile = createAsyncThunk<
  Kitchen,
  void,
  { rejectValue: string }
>("kitchen/fetchKitchenProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/profile`);
    return res.data as Kitchen;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to fetch your kitchen"
    );
  }
});

export const updateKitchenById = createAsyncThunk<
  { message: string; id: string },
  { id: string; body: UpdateKitchenPayload },
  { rejectValue: string }
>("kitchen/updateKitchenById", async ({ id, body }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`${BASE}/${id}`, body);
    const message = res.data?.message ?? "Kitchen updated successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to update kitchen"
    );
  }
});

export const updateKitchenByProfile = createAsyncThunk<
  { message: string },
  UpdateKitchenPayload,
  { rejectValue: string }
>("kitchen/updateKitchenByProfile", async (body, { rejectWithValue }) => {
  try {
    const res = await api.patch(`${BASE}/profile`, body);
    const message = res.data?.message ?? "Kitchen updated successfully";
    return { message };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to update your kitchen"
    );
  }
});

export const uploadKitchenCoverByProfile = createAsyncThunk<
  { message: string; kitchen: Kitchen },
  { uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverByProfile",
  async ({ uri, name, type }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      // @ts-ignore RN FormData shape
      form.append("cover_image" as any, {
        uri,
        name: name ?? "cover.jpg",
        type: type ?? "image/jpeg",
      });

      const res = await api.put(`${BASE}/profile/profile-picture`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // API returns message only; refetch canonical object
      const res2 = await api.get(`${BASE}/profile`);
      return {
        message: res.data?.message ?? "Profile picture updated successfully",
        kitchen: res2.data as Kitchen,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Failed to upload cover image"
      );
    }
  }
);

export const uploadKitchenCoverById = createAsyncThunk<
  { message: string; id: string; kitchen: Kitchen },
  { id: string; uri: string; name?: string; type?: string },
  { rejectValue: string }
>(
  "kitchen/uploadKitchenCoverById",
  async ({ id, uri, name, type }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      // @ts-ignore RN FormData shape
      form.append("cover_image" as any, {
        uri,
        name: name ?? "cover.jpg",
        type: type ?? "image/jpeg",
      });

      const res = await api.put(`${BASE}/${id}/profile-picture`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refetch updated
      const res2 = await api.get(`${BASE}/${id}`);
      return {
        message: res.data?.message ?? "Profile picture updated successfully",
        id,
        kitchen: res2.data as Kitchen,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Failed to upload cover image"
      );
    }
  }
);

export const likeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/likeKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/like`);
    const message = res.data?.message ?? "Kitchen liked successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to like kitchen"
    );
  }
});

export const unlikeKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unlikeKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/unlike`);
    const message = res.data?.message ?? "Kitchen unliked successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to unlike kitchen"
    );
  }
});

export const blockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/blockKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/block`);
    const message = res.data?.message ?? "Kitchen blocked successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to block kitchen"
    );
  }
});

export const unblockKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unblockKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/unblock`);
    const message = res.data?.message ?? "Kitchen unblocked successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to unblock kitchen"
    );
  }
});

export const verifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/verifyKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/verify`);
    const message = res.data?.message ?? "Kitchen verified successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to verify kitchen"
    );
  }
});

export const unverifyKitchen = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("kitchen/unverifyKitchen", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`${BASE}/${id}/unverify`);
    const message = res.data?.message ?? "Kitchen unverified successfully";
    return { message, id };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || "Failed to unverify kitchen"
    );
  }
});
