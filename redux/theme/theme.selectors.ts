import type { RootState } from "@/store";

export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectThemeStatus = (state: RootState) => state.theme.status;
