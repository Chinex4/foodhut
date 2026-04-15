import { createSlice } from "@reduxjs/toolkit";
import type { StorageApiState } from "./storageApi.types";
import { deleteStorageMedia, generateSignature, uploadStorageMedia } from "./storageApi.thunks";

const initialState: StorageApiState = {
  items: {},
  order: [],
  signature: null,
  uploadStatus: "idle",
  signatureStatus: "idle",
  deleteStatus: {},
  error: null,
};

const storageApiSlice = createSlice({
  name: "storageApi",
  initialState,
  reducers: {
    clearStorageApiState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadStorageMedia.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
      })
      .addCase(uploadStorageMedia.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";

        for (const media of action.payload) {
          state.items[media.id] = media;
        }

        const ids = action.payload.map((m) => m.id);
        const seen = new Set<string>();
        state.order = [...ids, ...state.order].filter((id) =>
          seen.has(id) ? false : (seen.add(id), true)
        );
      })
      .addCase(uploadStorageMedia.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = (action.payload as string) || "Failed to upload media";
      })
      .addCase(deleteStorageMedia.pending, (state, action) => {
        state.deleteStatus[action.meta.arg] = "loading";
        state.error = null;
      })
      .addCase(deleteStorageMedia.fulfilled, (state, action) => {
        const { fileId } = action.payload;
        state.deleteStatus[fileId] = "succeeded";
        delete state.items[fileId];
        state.order = state.order.filter((id) => id !== fileId);
      })
      .addCase(deleteStorageMedia.rejected, (state, action) => {
        const fileId = action.meta.arg;
        state.deleteStatus[fileId] = "failed";
        state.error = (action.payload as string) || "Failed to delete media";
      })
      .addCase(generateSignature.pending, (state) => {
        state.signatureStatus = "loading";
        state.error = null;
      })
      .addCase(generateSignature.fulfilled, (state, action) => {
        state.signatureStatus = "succeeded";
        state.signature = action.payload;
      })
      .addCase(generateSignature.rejected, (state, action) => {
        state.signatureStatus = "failed";
        state.error = (action.payload as string) || "Failed to generate signature";
      });
  },
});

export const { clearStorageApiState } = storageApiSlice.actions;
export default storageApiSlice.reducer;
