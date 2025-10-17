import type { RootState } from "@/store";
import type { UserId } from "./users.types";

export const selectUsersState = (s: RootState) => s.users;

export const selectMeId = (s: RootState) => s.users.currentId;

export const selectMe = (s: RootState) => {
  const id = s.users.currentId;
  return id ? s.users.entities[id] : null;
};

export const makeSelectUserById =
  (id: UserId) =>
  (s: RootState) =>
    s.users.entities[id] ?? null;

export const selectUsersError = (s: RootState) => s.users.error;

export const selectFetchMeStatus = (s: RootState) => s.users.fetchMeStatus;
export const selectUpdateMeStatus = (s: RootState) => s.users.updateMeStatus;
export const selectUploadPicStatus = (s: RootState) => s.users.uploadPicStatus;
export const selectDeleteMeStatus = (s: RootState) => s.users.deleteMeStatus;

export const makeSelectByIdStatus =
  (id: UserId) =>
  (s: RootState) =>
    s.users.byIdStatus[id] ?? "idle";
