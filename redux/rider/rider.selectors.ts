import { RootState } from "@/store";

export const selectRiderStatus = (s: RootState) => s.rider.status;
export const selectRiderError = (s: RootState) => s.rider.error;
export const selectCreatedRiderId = (s: RootState) => s.rider.riderId;
