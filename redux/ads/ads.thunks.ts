import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Ad,
  AdsListResponse,
  AdsQuery,
  CreateAdPayload,
  UpdateAdPayload,
} from "./ads.types";
import { mockAds } from "@/utils/mockData";

let ads: Ad[] = [...mockAds];

const listAds = (query?: AdsQuery): AdsListResponse => {
  const page = query?.page ?? 1;
  const perPage = query?.per_page ?? ads.length;
  const search = query?.search?.toLowerCase();
  const filtered = search
    ? ads.filter((ad) => ad.link.toLowerCase().includes(search))
    : ads;
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

export const createAd = createAsyncThunk<
  { id?: string; message: string },
  CreateAdPayload,
  { rejectValue: string }
>("ads/createAd", async (payload, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString();
    const newAd: Ad = {
      id: `ad-${ads.length + 1}`,
      link: payload.link,
      duration: Number(payload.duration),
      banner_image: payload.banner
        ? {
            public_id: "mock",
            timestamp: Date.now(),
            url: payload.banner.uri,
          }
        : null,
      created_at: now,
      updated_at: null,
    };
    ads = [newAd, ...ads];
    return { id: newAd.id, message: "Ad created!" };
  } catch (err: any) {
    return rejectWithValue("Failed to create ad");
  }
});

export const fetchAds = createAsyncThunk<
  AdsListResponse,
  AdsQuery | undefined,
  { rejectValue: string }
>("ads/fetchAds", async (query, { rejectWithValue }) => {
  try {
    return listAds(query);
  } catch (err: any) {
    return rejectWithValue("Failed to fetch ads");
  }
});

export const fetchAdById = createAsyncThunk<
  Ad,
  string,
  { rejectValue: string }
>("ads/fetchAdById", async (id, { rejectWithValue }) => {
  try {
    const ad = ads.find((item) => item.id === id);
    if (!ad) return rejectWithValue("Failed to fetch ad");
    return ad;
  } catch (err: any) {
    return rejectWithValue("Failed to fetch ad");
  }
});

export const updateAdById = createAsyncThunk<
  { message: string; id: string; ad?: Ad },
  { id: string; body: UpdateAdPayload },
  { rejectValue: string }
>("ads/updateAdById", async ({ id, body }, { rejectWithValue }) => {
  try {
    ads = ads.map((item) =>
      item.id === id
        ? {
            ...item,
            link: body.link ?? item.link,
            duration:
              body.duration !== undefined
                ? Number(body.duration)
                : item.duration,
            banner_image: body.banner
              ? {
                  public_id: "mock",
                  timestamp: Date.now(),
                  url: body.banner.uri,
                }
              : item.banner_image,
            updated_at: new Date().toISOString(),
          }
        : item
    );
    const updated = ads.find((item) => item.id === id);
    return {
      message: "Ad updated successfully",
      id,
      ad: updated,
    };
  } catch (err: any) {
    return rejectWithValue("Failed to update ad");
  }
});

export const deleteAdById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("ads/deleteAdById", async (id, { rejectWithValue }) => {
  try {
    ads = ads.filter((item) => item.id !== id);
    return { message: "Ad deleted successfully", id };
  } catch (err: any) {
    return rejectWithValue("Failed to delete ad");
  }
});
