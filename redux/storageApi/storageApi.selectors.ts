import type { RootState } from "@/store";

export const selectStorageApiState = (s: RootState) => s.storageApi;
export const selectStorageMediaEntities = (s: RootState) => s.storageApi.items;
export const selectStorageMediaIds = (s: RootState) => s.storageApi.order;
export const selectStorageMediaList = (s: RootState) =>
  s.storageApi.order.map((id) => s.storageApi.items[id]).filter(Boolean);

export const selectStorageUploadStatus = (s: RootState) => s.storageApi.uploadStatus;
export const makeSelectStorageDeleteStatus = (fileId: string) => (s: RootState) =>
  s.storageApi.deleteStatus[fileId] ?? "idle";

export const selectStorageApiError = (s: RootState) => s.storageApi.error;
