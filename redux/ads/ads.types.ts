export type AdId = string;

export type Media = {
  public_id: string;
  timestamp: number;
  url: string;
};

export type Ad = {
  id: AdId;
  link: string;
  duration: number;
  banner_image: Media | null;
  created_at: string;
  updated_at: string | null;
};

export type AdsQuery = {
  page?: number;
  per_page?: number;
  search?: string;
};

export type AdsListResponse = {
  items: Ad[];
  meta: { page: number; per_page: number; total: number };
};

export type CreateAdPayload = {
  duration: number | string;
  link: string;
  banner?: { uri: string; name?: string; type?: string };
};

export type UpdateAdPayload = Partial<{
  duration: number | string;
  link: string;
  banner: { uri: string; name?: string; type?: string };
}>;

export type AdsStatus = "idle" | "loading" | "succeeded" | "failed";

export type AdsState = {
  entities: Record<AdId, Ad>;

  lastListIds: AdId[];
  lastListMeta: { page: number; per_page: number; total: number } | null;
  lastListQuery: AdsQuery | null;

  listStatus: AdsStatus;
  createStatus: AdsStatus;
  byIdStatus: Record<AdId, AdsStatus>;
  updateByIdStatus: Record<AdId, AdsStatus>;
  deleteByIdStatus: Record<AdId, AdsStatus>;

  error: string | null;
};
