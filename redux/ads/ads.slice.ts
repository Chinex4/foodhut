import { createSlice } from "@reduxjs/toolkit";
import type { Ad, AdsState } from "./ads.types";
import {
  createAd,
  deleteAdById,
  fetchAdById,
  fetchAds,
  updateAdById,
} from "./ads.thunks";

const initialState: AdsState = {
  entities: {},

  lastListIds: [],
  lastListMeta: null,
  lastListQuery: null,

  listStatus: "idle",
  createStatus: "idle",
  byIdStatus: {},
  updateByIdStatus: {},
  deleteByIdStatus: {},

  error: null,
};

const upsert = (state: AdsState, ad: Ad) => {
  state.entities[ad.id] = ad;
};

const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    clearAdsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // CREATE
    builder
      .addCase(createAd.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createAd.rejected, (state, a) => {
        state.createStatus = "failed";
        state.error = (a.payload as string) || "Failed to create ad";
      });

    // LIST
    builder
      .addCase(fetchAds.pending, (state, a) => {
        state.listStatus = "loading";
        state.error = null;
        state.lastListQuery = a.meta.arg ?? null;
      })
      .addCase(fetchAds.fulfilled, (state, a) => {
        state.listStatus = "succeeded";
        const { items, meta } = a.payload;
        state.lastListIds = items.map((x) => x.id);
        state.lastListMeta = meta;
        items.forEach((x) => upsert(state, x));
      })
      .addCase(fetchAds.rejected, (state, a) => {
        state.listStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch ads";
      });

    // BY ID
    builder
      .addCase(fetchAdById.pending, (state, a) => {
        state.byIdStatus[a.meta.arg] = "loading";
      })
      .addCase(fetchAdById.fulfilled, (state, a) => {
        state.byIdStatus[a.payload.id] = "succeeded";
        upsert(state, a.payload);
      })
      .addCase(fetchAdById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to fetch ad";
      });

    // UPDATE
    builder
      .addCase(updateAdById.pending, (state, a) => {
        state.updateByIdStatus[a.meta.arg.id] = "loading";
      })
      .addCase(updateAdById.fulfilled, (state, a) => {
        const { id, ad } = a.payload;
        state.updateByIdStatus[id] = "succeeded";
        if (ad) upsert(state, ad);
      })
      .addCase(updateAdById.rejected, (state, a) => {
        const id = a.meta.arg.id;
        state.updateByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to update ad";
      });

    // DELETE
    builder
      .addCase(deleteAdById.pending, (state, a) => {
        state.deleteByIdStatus[a.meta.arg] = "loading";
      })
      .addCase(deleteAdById.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.deleteByIdStatus[id] = "succeeded";
        delete state.entities[id];
        state.lastListIds = state.lastListIds.filter((x) => x !== id);
        if (state.lastListMeta) {
          state.lastListMeta = {
            ...state.lastListMeta,
            total: Math.max(0, state.lastListMeta.total - 1),
          };
        }
      })
      .addCase(deleteAdById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.deleteByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to delete ad";
      });
  },
});

export const { clearAdsState } = adsSlice.actions;
export default adsSlice.reducer;
