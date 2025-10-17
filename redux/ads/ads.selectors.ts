// redux/ads/ads.selectors.ts
import type { RootState } from "@/store";
import type { AdId } from "./ads.types";

import { createSelector } from "@reduxjs/toolkit";

export const selectAdsState = (s: RootState) => s.ads;
export const selectAdsEntities = (s: RootState) => s.ads.entities;
export const selectAdsIds = (s: RootState) => s.ads.lastListIds;

export const selectAdsList = createSelector(
  [selectAdsIds, selectAdsEntities],
  (ids, entities) => ids.map((id: AdId) => entities[id]).filter(Boolean)
);

export const selectAdsMeta = (s: RootState) => s.ads.lastListMeta;
export const selectAdsQuery = (s: RootState) => s.ads.lastListQuery;

export const selectAdById = (id: AdId) => (s: RootState) =>
  s.ads.entities[id] ?? null;

export const selectAdsError = (s: RootState) => s.ads.error;

export const selectAdsListStatus = (s: RootState) => s.ads.listStatus;
export const selectAdCreateStatus = (s: RootState) => s.ads.createStatus;

export const makeSelectAdByIdStatus = (id: AdId) => (s: RootState) =>
  s.ads.byIdStatus[id] ?? "idle";

export const makeSelectAdUpdateStatus = (id: AdId) => (s: RootState) =>
  s.ads.updateByIdStatus[id] ?? "idle";

export const makeSelectAdDeleteStatus = (id: AdId) => (s: RootState) =>
  s.ads.deleteByIdStatus[id] ?? "idle";
