import type { RootState } from "@/store";
import type { KitchenId } from "./kitchen.types";

export const selectKitchenState = (s: RootState) => s.kitchen;

export const selectKitchenById =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.entities[id] ?? null;

export const selectKitchensList = (s: RootState) =>
  s.kitchen.lastListIds.map((id) => s.kitchen.entities[id]).filter(Boolean);

export const selectKitchensMeta = (s: RootState) => s.kitchen.lastListMeta;
export const selectKitchensQuery = (s: RootState) => s.kitchen.lastListQuery;

export const selectKitchenProfileId = (s: RootState) => s.kitchen.profileId;
export const selectKitchenProfile = (s: RootState) => {
  const id = s.kitchen.profileId;
  return id ? s.kitchen.entities[id] : null;
};

// Status & errors
export const selectKitchensError = (s: RootState) => s.kitchen.error;
export const selectListStatus = (s: RootState) => s.kitchen.listStatus;
export const selectProfileStatus = (s: RootState) => s.kitchen.profileStatus;
export const selectKitchenProfileStatus = (s: RootState) => s.kitchen.profileStatus;
export const selectCreateKitchenStatus = (s: RootState) => s.kitchen.createStatus;

export const makeSelectByIdStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.byIdStatus[id] ?? "idle";

export const makeSelectUpdateByIdStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.updateByIdStatus[id] ?? "idle";

export const makeSelectUploadCoverByIdStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.uploadCoverByIdStatus[id] ?? "idle";

export const makeSelectLikeStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.likeStatus[id] ?? "idle";

export const makeSelectBlockStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.blockStatus[id] ?? "idle";

export const makeSelectVerifyStatus =
  (id: KitchenId) =>
  (s: RootState) =>
    s.kitchen.verifyStatus[id] ?? "idle";

export const selectCities = (s: RootState) => s.kitchen.cities;
export const selectCitiesStatus = (s: RootState) => s.kitchen.citiesStatus;
export const selectCityCreateStatus = (s: RootState) => s.kitchen.cityCreateStatus;

export const selectTypes = (s: RootState) => s.kitchen.types;
export const selectTypesStatus = (s: RootState) => s.kitchen.typesStatus;

export const selectUpdateProfileStatus = (s: RootState) => s.kitchen.updateProfileStatus;
export const selectUploadCoverProfileStatus = (s: RootState) => s.kitchen.uploadCoverProfileStatus;
