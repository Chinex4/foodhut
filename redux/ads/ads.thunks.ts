import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import type {
  Ad,
  AdsListResponse,
  AdsQuery,
  CreateAdPayload,
  UpdateAdPayload,
} from "./ads.types";

const BASE = "/ads";

const buildQuery = (q?: AdsQuery) => {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.per_page) p.set("per_page", String(q.per_page));
  if (q.search) p.set("search", q.search);
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const createAd = createAsyncThunk<
  { id?: string; message: string },
  CreateAdPayload,
  { rejectValue: string }
>("ads/createAd", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("duration", String(payload.duration));
    form.append("link", payload.link);
    if (payload.banner) {
      // @ts-ignore RN FormData shape
      form.append("banner_image" as any, {
        uri: payload.banner.uri,
        name: payload.banner.name ?? "banner.jpg",
        type: payload.banner.type ?? "image/jpeg",
      });
    }
    const res = await api.post(`${BASE}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      id: res.data?.id as string | undefined,
      message: res.data?.message ?? res.data?.data ?? "Ad created!",
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to create ad");
  }
});

export const fetchAds = createAsyncThunk<
  AdsListResponse,
  AdsQuery | undefined,
  { rejectValue: string }
>("ads/fetchAds", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}${buildQuery(query)}`);
    return res.data as AdsListResponse;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to fetch ads");
  }
});

export const fetchAdById = createAsyncThunk<
  Ad,
  string,
  { rejectValue: string }
>("ads/fetchAdById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data as Ad;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to fetch ad");
  }
});

export const updateAdById = createAsyncThunk<
  { message: string; id: string; ad?: Ad },
  { id: string; body: UpdateAdPayload },
  { rejectValue: string }
>("ads/updateAdById", async ({ id, body }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    if (body.duration !== undefined)
      form.append("duration", String(body.duration));
    if (body.link !== undefined) form.append("link", String(body.link));
    if (body.banner) {
      // @ts-ignore RN FormData shape
      form.append("banner_image" as any, {
        uri: body.banner.uri,
        name: body.banner.name ?? "banner.jpg",
        type: body.banner.type ?? "image/jpeg",
      });
    }
    const res = await api.patch(`${BASE}/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const latest = await api.get(`${BASE}/${id}`);
    return {
      message: res.data?.message ?? "Ad updated successfully",
      id,
      ad: latest.data as Ad,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to update ad");
  }
});

export const deleteAdById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("ads/deleteAdById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`${BASE}/${id}`);
    return { message: res.data?.message ?? "Ad deleted successfully", id };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error || "Failed to delete ad");
  }
});
