import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, UsersState } from "./users.types";
import {
  deleteMyProfile,
  fetchMyProfile,
  fetchUserById,
  updateMyProfile,
  uploadProfilePicture,
} from "./users.thunks";

const initialState: UsersState = {
  entities: {},
  currentId: null,
  fetchMeStatus: "idle",
  updateMeStatus: "idle",
  uploadPicStatus: "idle",
  deleteMeStatus: "idle",
  byIdStatus: {},
  error: null,
};

const upsert = (state: UsersState, user: User) => {
  state.entities[user.id] = user;
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersState(state) {
      Object.assign(state, initialState);
    },
    setCurrentId(state, action: PayloadAction<string | null>) {
      state.currentId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.fetchMeStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.fetchMeStatus = "succeeded";
        upsert(state, action.payload);
        state.currentId = action.payload.id;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.fetchMeStatus = "failed";
        state.error = (action.payload as string) || "Failed to load profile";
      });

    builder
      .addCase(updateMyProfile.pending, (state) => {
        state.updateMeStatus = "loading";
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.updateMeStatus = "succeeded";
        upsert(state, action.payload);
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.updateMeStatus = "failed";
        state.error = (action.payload as string) || "Failed to update profile";
      });

    builder
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadPicStatus = "loading";
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploadPicStatus = "succeeded";
        upsert(state, action.payload);
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadPicStatus = "failed";
        state.error = (action.payload as string) || "Failed to upload picture";
      });

    builder
      .addCase(fetchUserById.pending, (state, action) => {
        const id = action.meta.arg;
        state.byIdStatus[id] = "loading";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        const user = action.payload;
        state.byIdStatus[user.id] = "succeeded";
        upsert(state, user);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        const id = action.meta.arg;
        state.byIdStatus[id] = "failed";
        state.error = (action.payload as string) || "Failed to load user";
      });

    builder
      .addCase(deleteMyProfile.pending, (state) => {
        state.deleteMeStatus = "loading";
        state.error = null;
      })
      .addCase(deleteMyProfile.fulfilled, (state) => {
        state.deleteMeStatus = "succeeded";
        if (state.currentId) delete state.entities[state.currentId];
        state.currentId = null;
      })
      .addCase(deleteMyProfile.rejected, (state, action) => {
        state.deleteMeStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete account";
      });
  },
});

export const { clearUsersState, setCurrentId } = usersSlice.actions;
export default usersSlice.reducer;
