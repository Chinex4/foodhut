import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/api/http";
import { uploadMedia } from "@/api/storage";
import type { MediaDescription } from "@/api/storage";
import type { UploadMediaPayload } from "./storageApi.types";

type DeleteMediaResponse = {
  _tag: "DeleteMediaResponse";
};

export const uploadStorageMedia = createAsyncThunk<
  MediaDescription[],
  UploadMediaPayload,
  { rejectValue: string }
>("storageApi/uploadStorageMedia", async ({ files }, { rejectWithValue }) => {
  try {
    return await uploadMedia(files);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to upload media"));
  }
});

export const deleteStorageMedia = createAsyncThunk<
  { fileId: string },
  string,
  { rejectValue: string }
>("storageApi/deleteStorageMedia", async (fileId, { rejectWithValue }) => {
  try {
    await api.delete<DeleteMediaResponse>(`/storage/${fileId}`);
    return { fileId };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to delete media"));
  }
});
