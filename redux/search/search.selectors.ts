// redux/search/search.selectors.ts
import type { RootState } from "@/store";
import type { SearchItem } from "./search.types";

export const selectSearchState = (s: RootState) => s.search;

export const selectSearchItems = (s: RootState): SearchItem[] => s.search.items;
export const selectSearchMeta = (s: RootState) => s.search.meta;
export const selectSearchQuery = (s: RootState) => s.search.query;
export const selectSearchStatus = (s: RootState) => s.search.status;
export const selectSearchError = (s: RootState) => s.search.error;

// Convenience splitters
export const selectSearchMeals = (s: RootState) =>
  s.search.items.filter((x) => x.kind === "meal");

export const selectSearchKitchens = (s: RootState) =>
  s.search.items.filter((x) => x.kind === "kitchen");
