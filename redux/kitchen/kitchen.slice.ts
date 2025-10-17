import { createSlice } from "@reduxjs/toolkit";
import type { Kitchen, KitchensState } from "./kitchen.types";
import {
  blockKitchen,
  createKitchen,
  createKitchenCity,
  fetchKitchenById,
  fetchKitchenCities,
  fetchKitchenProfile,
  fetchKitchenTypes,
  fetchKitchens,
  likeKitchen,
  unblockKitchen,
  unlikeKitchen,
  updateKitchenById,
  updateKitchenByProfile,
  uploadKitchenCoverById,
  uploadKitchenCoverByProfile,
  verifyKitchen,
  unverifyKitchen,
} from "./kitchen.thunks";

const initialState: KitchensState = {
  entities: {},
  cities: [],
  types: [],

  lastListIds: [],
  lastListMeta: null,
  lastListQuery: null,

  profileId: null,

  listStatus: "idle",
  profileStatus: "idle",
  byIdStatus: {},
  createStatus: "idle",
  updateByIdStatus: {},
  updateProfileStatus: "idle",
  uploadCoverByIdStatus: {},
  uploadCoverProfileStatus: "idle",
  likeStatus: {},
  blockStatus: {},
  verifyStatus: {},

  citiesStatus: "idle",
  cityCreateStatus: "idle",
  typesStatus: "idle",

  error: null,
};

const upsert = (state: KitchensState, k: Kitchen) => {
  state.entities[k.id] = k;
};

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    clearKitchenState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createKitchen.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createKitchen.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createKitchen.rejected, (state, a) => {
        state.createStatus = "failed";
        state.error = (a.payload as string) || "Failed to create kitchen";
      });

    builder
      .addCase(fetchKitchens.pending, (state, a) => {
        state.listStatus = "loading";
        state.error = null;
        state.lastListQuery = a.meta.arg ?? null;
      })
      .addCase(fetchKitchens.fulfilled, (state, a) => {
        state.listStatus = "succeeded";
        const { items, meta } = a.payload;
        state.lastListIds = items.map((k) => k.id);
        state.lastListMeta = meta;
        items.forEach((k) => upsert(state, k));
      })
      .addCase(fetchKitchens.rejected, (state, a) => {
        state.listStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch kitchens";
      });

    builder
      .addCase(fetchKitchenById.pending, (state, a) => {
        state.byIdStatus[a.meta.arg] = "loading";
      })
      .addCase(fetchKitchenById.fulfilled, (state, a) => {
        state.byIdStatus[a.payload.id] = "succeeded";
        upsert(state, a.payload);
      })
      .addCase(fetchKitchenById.rejected, (state, a) => {
        const id = a.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to fetch kitchen";
      });
    builder
      .addCase(fetchKitchenProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(fetchKitchenProfile.fulfilled, (state, a) => {
        state.profileStatus = "succeeded";
        const k = a.payload;
        upsert(state, k);
        state.profileId = k.id;
      })
      .addCase(fetchKitchenProfile.rejected, (state, a) => {
        state.profileStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch your kitchen";
      });
    builder
      .addCase(updateKitchenById.pending, (state, a) => {
        state.updateByIdStatus[a.meta.arg.id] = "loading";
      })
      .addCase(updateKitchenById.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.updateByIdStatus[id] = "succeeded";
      })
      .addCase(updateKitchenById.rejected, (state, a) => {
        const id = a.meta.arg.id;
        state.updateByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to update kitchen";
      });
    builder
      .addCase(updateKitchenByProfile.pending, (state) => {
        state.updateProfileStatus = "loading";
      })
      .addCase(updateKitchenByProfile.fulfilled, (state) => {
        state.updateProfileStatus = "succeeded";
      })
      .addCase(updateKitchenByProfile.rejected, (state, a) => {
        state.updateProfileStatus = "failed";
        state.error = (a.payload as string) || "Failed to update your kitchen";
      });
    builder
      .addCase(uploadKitchenCoverByProfile.pending, (state) => {
        state.uploadCoverProfileStatus = "loading";
      })
      .addCase(uploadKitchenCoverByProfile.fulfilled, (state, a) => {
        state.uploadCoverProfileStatus = "succeeded";
        upsert(state, a.payload.kitchen);
        state.profileId = a.payload.kitchen.id;
      })
      .addCase(uploadKitchenCoverByProfile.rejected, (state, a) => {
        state.uploadCoverProfileStatus = "failed";
        state.error = (a.payload as string) || "Failed to upload cover";
      });
    builder
      .addCase(uploadKitchenCoverById.pending, (state, a) => {
        state.uploadCoverByIdStatus[a.meta.arg.id] = "loading";
      })
      .addCase(uploadKitchenCoverById.fulfilled, (state, a) => {
        const { id, kitchen } = a.payload;
        state.uploadCoverByIdStatus[id] = "succeeded";
        upsert(state, kitchen);
      })
      .addCase(uploadKitchenCoverById.rejected, (state, a) => {
        const id = a.meta.arg.id;
        state.uploadCoverByIdStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to upload cover";
      });
    builder
      .addCase(likeKitchen.pending, (state, a) => {
        state.likeStatus[a.meta.arg] = "loading";
      })
      .addCase(likeKitchen.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.likeStatus[id] = "succeeded";
        const k = state.entities[id];
        if (k) k.likes = (k.likes ?? 0) + 1;
      })
      .addCase(likeKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.likeStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to like kitchen";
      });

    builder
      .addCase(unlikeKitchen.pending, (state, a) => {
        state.likeStatus[a.meta.arg] = "loading";
      })
      .addCase(unlikeKitchen.fulfilled, (state, a) => {
        const id = a.payload.id;
        state.likeStatus[id] = "succeeded";
        const k = state.entities[id];
        if (k) k.likes = Math.max(0, (k.likes ?? 0) - 1);
      })
      .addCase(unlikeKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.likeStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to unlike kitchen";
      });

    builder
      .addCase(blockKitchen.pending, (state, a) => {
        state.blockStatus[a.meta.arg] = "loading";
      })
      .addCase(blockKitchen.fulfilled, (state, a) => {
        state.blockStatus[a.payload.id] = "succeeded";
      })
      .addCase(blockKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.blockStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to block kitchen";
      });

    builder
      .addCase(unblockKitchen.pending, (state, a) => {
        state.blockStatus[a.meta.arg] = "loading";
      })
      .addCase(unblockKitchen.fulfilled, (state, a) => {
        state.blockStatus[a.payload.id] = "succeeded";
      })
      .addCase(unblockKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.blockStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to unblock kitchen";
      });

    builder
      .addCase(verifyKitchen.pending, (state, a) => {
        state.verifyStatus[a.meta.arg] = "loading";
      })
      .addCase(verifyKitchen.fulfilled, (state, a) => {
        state.verifyStatus[a.payload.id] = "succeeded";
      })
      .addCase(verifyKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.verifyStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to verify kitchen";
      });

    builder
      .addCase(unverifyKitchen.pending, (state, a) => {
        state.verifyStatus[a.meta.arg] = "loading";
      })
      .addCase(unverifyKitchen.fulfilled, (state, a) => {
        state.verifyStatus[a.payload.id] = "succeeded";
      })
      .addCase(unverifyKitchen.rejected, (state, a) => {
        const id = a.meta.arg;
        state.verifyStatus[id] = "failed";
        state.error = (a.payload as string) || "Failed to unverify kitchen";
      });

    builder
      .addCase(fetchKitchenTypes.pending, (state) => {
        state.typesStatus = "loading";
      })
      .addCase(fetchKitchenTypes.fulfilled, (state, a) => {
        state.typesStatus = "succeeded";
        state.types = a.payload;
      })
      .addCase(fetchKitchenTypes.rejected, (state, a) => {
        state.typesStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch kitchen types";
      });

    builder
      .addCase(fetchKitchenCities.pending, (state) => {
        state.citiesStatus = "loading";
      })
      .addCase(fetchKitchenCities.fulfilled, (state, a) => {
        state.citiesStatus = "succeeded";
        state.cities = a.payload;
      })
      .addCase(fetchKitchenCities.rejected, (state, a) => {
        state.citiesStatus = "failed";
        state.error = (a.payload as string) || "Failed to fetch cities";
      });

    builder
      .addCase(createKitchenCity.pending, (state) => {
        state.cityCreateStatus = "loading";
      })
      .addCase(createKitchenCity.fulfilled, (state) => {
        state.cityCreateStatus = "succeeded";
      })
      .addCase(createKitchenCity.rejected, (state, a) => {
        state.cityCreateStatus = "failed";
        state.error = (a.payload as string) || "Failed to create city";
      });
  },
});

export const { clearKitchenState } = kitchenSlice.actions;
export default kitchenSlice.reducer;
