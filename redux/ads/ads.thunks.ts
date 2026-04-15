import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { compactQuery, getApiErrorMessage } from "@/api/http";
import { getStorageFileUrl, uploadSingleMedia } from "@/api/storage";
import type {
  Ad,
  AdsListResponse,
  AdsQuery,
  CreateAdPayload,
  UpdateAdPayload,
} from "./ads.types";

type BackendAd = {
  id: string;
  duration: number;
  link: string;
  banner_image_id: string;
  created_at: number;
  updated_at: number | null;
};

type BackendAdWithMedia = BackendAd & {
  banner_image: {
    id: string;
    url: string;
  };
};

type BackendAdsList = {
  items: BackendAd[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

const toAd = (ad: BackendAd): Ad => ({
  id: ad.id,
  duration: ad.duration,
  link: ad.link,
  banner_image_id: ad.banner_image_id,
  banner_image: ad.banner_image_id
    ? {
        id: ad.banner_image_id,
        url: getStorageFileUrl(ad.banner_image_id) ?? "",
      }
    : null,
  created_at: ad.created_at,
  updated_at: ad.updated_at,
});

const toAdWithMedia = (ad: BackendAdWithMedia): Ad => ({
  id: ad.id,
  duration: ad.duration,
  link: ad.link,
  banner_image_id: ad.banner_image_id,
  banner_image: {
    id: ad.banner_image?.id ?? ad.banner_image_id,
    url: ad.banner_image?.url ?? getStorageFileUrl(ad.banner_image_id) ?? "",
  },
  created_at: ad.created_at,
  updated_at: ad.updated_at,
});

export const createAd = createAsyncThunk<
  { id?: string; message: string },
  CreateAdPayload,
  { rejectValue: string }
>("ads/createAd", async (payload, { rejectWithValue }) => {
  try {
    let bannerImageId: string | null = payload.banner_image_id ?? null;
    if (!bannerImageId && payload.banner) {
      const uploaded = await uploadSingleMedia(payload.banner);
      bannerImageId = uploaded?.id ?? null;
    }

    if (!bannerImageId) {
      return rejectWithValue("Ad banner image is required");
    }

    const { data } = await api.post<{ id: string }>("/ads", {
      duration: Number(payload.duration),
      link: payload.link,
      banner_image_id: bannerImageId,
    });

    return { id: data?.id, message: "Ad created!" };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create ad"));
  }
});

export const fetchAds = createAsyncThunk<
  AdsListResponse,
  AdsQuery | undefined,
  { rejectValue: string }
>("ads/fetchAds", async (query, { rejectWithValue }) => {
  try {
    const params = compactQuery({
      page: query?.page,
      per_page: query?.per_page,
      search: query?.search,
    });

    const { data } = await api.get<BackendAdsList>("/ads", { params });

    return {
      items: (data.items ?? []).map(toAd),
      meta: data.meta,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch ads"));
  }
});

export const fetchAdById = createAsyncThunk<Ad, string, { rejectValue: string }>(
  "ads/fetchAdById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BackendAdWithMedia>(`/ads/${id}`);
      return toAdWithMedia(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch ad"));
    }
  }
);

export const updateAdById = createAsyncThunk<
  { message: string; id: string; ad?: Ad },
  { id: string; body: UpdateAdPayload },
  { rejectValue: string }
>("ads/updateAdById", async ({ id, body }, { dispatch, rejectWithValue }) => {
  try {
    let bannerImageId = body.banner_image_id;
    if (body.banner) {
      const uploaded = await uploadSingleMedia(body.banner);
      bannerImageId = uploaded?.id;
    }

    await api.patch(`/ads/${id}`, {
      duration: body.duration !== undefined ? Number(body.duration) : undefined,
      link: body.link,
      banner_image: bannerImageId,
    });

    const ad = await dispatch(fetchAdById(id)).unwrap();

    return {
      message: "Ad updated successfully",
      id,
      ad,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update ad"));
  }
});

export const deleteAdById = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("ads/deleteAdById", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/ads/${id}`);
    return { message: "Ad deleted successfully", id };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to delete ad"));
  }
});
