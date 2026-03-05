import type { MediaDescription, UploadableFile } from "@/api/storage";

export type StorageApiState = {
  items: Record<string, MediaDescription>;
  order: string[];
  uploadStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  error: string | null;
};

export type UploadMediaPayload = {
  files: UploadableFile[];
};
