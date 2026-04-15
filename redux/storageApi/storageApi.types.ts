import type { MediaDescription, UploadableFile } from "@/api/storage";

export type StorageApiState = {
  items: Record<string, MediaDescription>;
  order: string[];
  signature: UploadSignature | null;
  uploadStatus: "idle" | "loading" | "succeeded" | "failed";
  signatureStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  error: string | null;
};

export type UploadMediaPayload = {
  files: UploadableFile[];
};

export type UploadSignature = {
  id: string;
  upload_url: string;
  payload: {
    public_id: string;
    api_key: string;
    folder: string;
    notification_url: string;
    timestamp: number;
    context: string;
    signature: string;
  };
  _tag: "GenerateSignatureSuccessResponse";
};
