import type { RootState } from "@/store";

export const selectLogisticsState = (s: RootState) => s.logistics;
export const selectLogisticsStatus = (s: RootState) => s.logistics.listStatus;
export const selectLogisticsMutationStatus = (s: RootState) =>
  s.logistics.mutationStatus;
export const selectLogisticsError = (s: RootState) => s.logistics.error;

export const selectLogisticsRiders = (s: RootState) =>
  s.logistics.riderOrder.map((id) => s.logistics.riders[id]).filter(Boolean);
export const selectRiderProfile = (s: RootState) => s.logistics.riderProfile;

export const selectLogisticsCompanies = (s: RootState) =>
  s.logistics.companyOrder.map((id) => s.logistics.companies[id]).filter(Boolean);

export const selectDeliveries = (s: RootState) =>
  s.logistics.deliveryOrder.map((id) => s.logistics.deliveries[id]).filter(Boolean);

export const selectOffersForOrder = (orderId: string) => (s: RootState) =>
  (s.logistics.offersByOrder[orderId] ?? [])
    .map((id) => s.logistics.offers[id])
    .filter(Boolean);
