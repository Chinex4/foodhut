import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";

export type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type MediaDescription = {
  source: string;
  id: string;
  url?: string | null;
  meta?: Record<string, string | null | undefined> | null;
};

type UploadMediaResponse = {
  data: MediaDescription[];
  _tag: "UploadMediaResponse";
};

export const getStorageFileUrl = (fileId?: string | null): string | null => {
  if (!fileId) return null;
  const base = (api.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${base}/storage/${fileId}`;
};

export const getMediaUrl = (
  media?: Partial<MediaDescription> | null,
  fileId?: string | null
): string | null => {
  return (
    media?.url?.trim() ||
    media?.meta?.secure_url?.trim() ||
    getStorageFileUrl(fileId ?? media?.id) ||
    null
  );
};

export const uploadMedia = async (files: UploadableFile[]): Promise<MediaDescription[]> => {
  if (!files.length) return [];

  const form = new FormData();
  for (const f of files) {
    form.append("files", {
      uri: f.uri,
      name: f.name ?? "upload.jpg",
      type: f.type ?? "image/jpeg",
    } as any);
  }

  try {
    const { data } = await api.post<UploadMediaResponse>("/storage/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data?.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to upload media"));
  }
};

export const uploadSingleMedia = async (file: UploadableFile): Promise<MediaDescription | null> => {
  const uploaded = await uploadMedia([file]);
  return uploaded[0] ?? null;
};
