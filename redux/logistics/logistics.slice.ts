import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type {
  Delivery,
  DeliveryOffer,
  LogisticsCompany,
  LogisticsRider,
  LogisticsState,
} from "./logistics.types";
import {
  acceptDeliveryOffer,
  counterDeliveryOffer,
  createDeliveryOffer,
  createLogisticsCompany,
  createLogisticsRider,
  fetchDeliveries,
  fetchDeliveryOffers,
  fetchLogisticsCompanies,
  fetchLogisticsRiders,
  fetchRiderProfile,
  rejectDeliveryOffer,
  riderAcceptCounterOffer,
  submitRiderKyc,
  updateDeliveryStatus,
  updateRiderStatus,
} from "./logistics.thunks";

const initialState: LogisticsState = {
  riders: {},
  riderOrder: [],
  riderMeta: null,
  riderProfile: null,
  companies: {},
  companyOrder: [],
  companyMeta: null,
  deliveries: {},
  deliveryOrder: [],
  deliveryMeta: null,
  offersByOrder: {},
  offers: {},
  listStatus: "idle",
  mutationStatus: "idle",
  error: null,
};

const upsertRiders = (state: LogisticsState, riders: LogisticsRider[]) => {
  for (const rider of riders) state.riders[rider.id] = rider;
  state.riderOrder = riders.map((rider) => rider.id);
};

const upsertCompanies = (state: LogisticsState, companies: LogisticsCompany[]) => {
  for (const company of companies) state.companies[company.id] = company;
  state.companyOrder = companies.map((company) => company.id);
};

const upsertDeliveries = (state: LogisticsState, deliveries: Delivery[]) => {
  for (const delivery of deliveries) state.deliveries[delivery.id] = delivery;
  state.deliveryOrder = deliveries.map((delivery) => delivery.id);
};

const upsertOffer = (state: LogisticsState, offer: DeliveryOffer) => {
  state.offers[offer.id] = offer;
  const ids = state.offersByOrder[offer.order_id] ?? [];
  if (!ids.includes(offer.id)) state.offersByOrder[offer.order_id] = [offer.id, ...ids];
};

const logisticsSlice = createSlice({
  name: "logistics",
  initialState,
  reducers: {
    clearLogisticsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogisticsRiders.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.riderMeta = action.payload.meta;
        upsertRiders(state, action.payload.items ?? []);
      })
      .addCase(fetchRiderProfile.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.riderProfile = action.payload;
        if (action.payload) state.riders[action.payload.id] = action.payload;
      })
      .addCase(fetchLogisticsCompanies.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.companyMeta = action.payload.meta;
        upsertCompanies(state, action.payload.items ?? []);
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.deliveryMeta = action.payload.meta;
        upsertDeliveries(state, action.payload.items ?? []);
      })
      .addCase(fetchDeliveryOffers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.offersByOrder[action.payload.order_id] = action.payload.offers.map(
          (offer) => offer.id
        );
        for (const offer of action.payload.offers) state.offers[offer.id] = offer;
      })
      .addCase(createLogisticsRider.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.riderProfile = action.payload;
        state.riders[action.payload.id] = action.payload;
        if (!state.riderOrder.includes(action.payload.id)) {
          state.riderOrder.unshift(action.payload.id);
        }
      })
      .addCase(createLogisticsCompany.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.companies[action.payload.id] = action.payload;
        if (!state.companyOrder.includes(action.payload.id)) {
          state.companyOrder.unshift(action.payload.id);
        }
      })
      .addCase(updateRiderStatus.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.riders[action.payload.id] = action.payload;
        if (state.riderProfile?.id === action.payload.id) state.riderProfile = action.payload;
      })
      .addCase(submitRiderKyc.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const rider = state.riders[action.payload.rider_id] ?? state.riderProfile;
        if (rider) rider.kyc = action.payload;
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.deliveries[action.payload.id] = action.payload;
      })
      .addMatcher(
        isAnyOf(
          createDeliveryOffer.fulfilled,
          counterDeliveryOffer.fulfilled,
          acceptDeliveryOffer.fulfilled,
          riderAcceptCounterOffer.fulfilled,
          rejectDeliveryOffer.fulfilled
        ),
        (state, action) => {
          state.mutationStatus = "succeeded";
          upsertOffer(state, action.payload);
        }
      )
      .addMatcher(
        isAnyOf(
          fetchLogisticsRiders.pending,
          fetchRiderProfile.pending,
          fetchLogisticsCompanies.pending,
          fetchDeliveries.pending,
          fetchDeliveryOffers.pending
        ),
        (state) => {
          state.listStatus = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          createLogisticsRider.pending,
          createLogisticsCompany.pending,
          updateRiderStatus.pending,
          submitRiderKyc.pending,
          updateDeliveryStatus.pending,
          createDeliveryOffer.pending,
          counterDeliveryOffer.pending,
          acceptDeliveryOffer.pending,
          riderAcceptCounterOffer.pending,
          rejectDeliveryOffer.pending
        ),
        (state) => {
          state.mutationStatus = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("logistics/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.listStatus = "failed";
          state.mutationStatus = "failed";
          state.error = action.payload || "Logistics request failed";
        }
      );
  },
});

export const { clearLogisticsState } = logisticsSlice.actions;
export default logisticsSlice.reducer;
