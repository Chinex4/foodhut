import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios";
import { boolToQueryString, compactQuery, getApiErrorMessage } from "@/api/http";
import type {
  CreateCompanyPayload,
  CreateRiderPayload,
  Delivery,
  DeliveryOffer,
  DeliveryStatus,
  FetchDeliveriesQuery,
  FetchRidersQuery,
  LogisticsCompany,
  LogisticsRider,
  PaginationMeta,
  RiderKyc,
  SubmitCompanyKycPayload,
  SubmitRiderKycPayload,
  VerifyKycPayload,
} from "./logistics.types";

type ListResponse<T> = { items: T[]; meta: PaginationMeta };
type OffersResponse = { data: DeliveryOffer[] };

export const createLogisticsCompany = createAsyncThunk<
  LogisticsCompany,
  CreateCompanyPayload,
  { rejectValue: string }
>("logistics/createCompany", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<LogisticsCompany>("/logistics/companies", body);
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create logistics company"));
  }
});

export const fetchLogisticsCompanies = createAsyncThunk<
  ListResponse<LogisticsCompany>,
  FetchRidersQuery | undefined,
  { rejectValue: string }
>("logistics/fetchCompanies", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ListResponse<LogisticsCompany>>("/logistics/companies", {
      params: compactQuery({
        page: query?.page,
        per_page: query?.per_page,
        search: query?.search,
      }),
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch logistics companies"));
  }
});

export const createLogisticsRider = createAsyncThunk<
  LogisticsRider,
  CreateRiderPayload | null,
  { rejectValue: string }
>("logistics/createRider", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<LogisticsRider>("/logistics/riders", body);
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create rider"));
  }
});

export const fetchLogisticsRiders = createAsyncThunk<
  ListResponse<LogisticsRider>,
  FetchRidersQuery | undefined,
  { rejectValue: string }
>("logistics/fetchRiders", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ListResponse<LogisticsRider>>("/logistics/riders", {
      params: compactQuery({
        page: query?.page,
        per_page: query?.per_page,
        logistics_company_id: query?.logistics_company_id,
        is_available: boolToQueryString(query?.is_available),
        search: query?.search,
      }),
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch riders"));
  }
});

export const fetchRiderProfile = createAsyncThunk<
  LogisticsRider | null,
  void,
  { rejectValue: string }
>("logistics/fetchRiderProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ListResponse<LogisticsRider>>("/logistics/riders", {
      params: { page: 1, per_page: 1 },
    });
    return data.items?.[0] ?? null;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch rider profile"));
  }
});

export const updateRiderStatus = createAsyncThunk<
  LogisticsRider,
  { rider_id: string; is_available: boolean; is_blocked: boolean },
  { rejectValue: string }
>("logistics/updateRiderStatus", async ({ rider_id, ...body }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<LogisticsRider>(
      `/logistics/riders/${rider_id}/status`,
      body
    );
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update rider status"));
  }
});

export const submitRiderKyc = createAsyncThunk<
  RiderKyc,
  SubmitRiderKycPayload,
  { rejectValue: string }
>("logistics/submitRiderKyc", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<RiderKyc>("/logistics/riders/kyc", body);
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to submit rider KYC"));
  }
});

export const verifyRiderKyc = createAsyncThunk<
  RiderKyc,
  VerifyKycPayload,
  { rejectValue: string }
>("logistics/verifyRiderKyc", async ({ kyc_id, verification_status }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<RiderKyc>(`/logistics/riders/kyc/${kyc_id}/verify`, {
      verification_status,
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to verify rider KYC"));
  }
});

export const submitCompanyKyc = createAsyncThunk<
  unknown,
  SubmitCompanyKycPayload,
  { rejectValue: string }
>("logistics/submitCompanyKyc", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/logistics/companies/kyc", body);
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to submit company KYC"));
  }
});

export const verifyCompanyKyc = createAsyncThunk<
  unknown,
  VerifyKycPayload,
  { rejectValue: string }
>("logistics/verifyCompanyKyc", async ({ kyc_id, verification_status }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/logistics/companies/kyc/${kyc_id}/verify`, {
      verification_status,
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to verify company KYC"));
  }
});

export const fetchDeliveries = createAsyncThunk<
  ListResponse<Delivery>,
  FetchDeliveriesQuery | undefined,
  { rejectValue: string }
>("logistics/fetchDeliveries", async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ListResponse<Delivery>>("/logistics/deliveries", {
      params: compactQuery({
        page: query?.page,
        per_page: query?.per_page,
        rider_id: query?.rider_id,
        delivery_status: query?.delivery_status,
        before: query?.before,
        after: query?.after,
      }),
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch deliveries"));
  }
});

export const updateDeliveryStatus = createAsyncThunk<
  Delivery,
  { delivery_id: string; delivery_status: DeliveryStatus },
  { rejectValue: string }
>("logistics/updateDeliveryStatus", async ({ delivery_id, delivery_status }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<Delivery>(`/logistics/deliveries/${delivery_id}/status`, {
      delivery_status,
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to update delivery status"));
  }
});

export const fetchDeliveryOffers = createAsyncThunk<
  { order_id: string; offers: DeliveryOffer[] },
  string,
  { rejectValue: string }
>("logistics/fetchDeliveryOffers", async (order_id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<OffersResponse>(`/logistics/orders/${order_id}/offers`);
    return { order_id, offers: data.data ?? [] };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to fetch delivery offers"));
  }
});

export const createDeliveryOffer = createAsyncThunk<
  DeliveryOffer,
  { order_id: string; amount: number },
  { rejectValue: string }
>("logistics/createDeliveryOffer", async ({ order_id, amount }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<DeliveryOffer>(`/logistics/orders/${order_id}/offers`, {
      amount,
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to create delivery offer"));
  }
});

export const counterDeliveryOffer = createAsyncThunk<
  DeliveryOffer,
  { offer_id: string; amount: number },
  { rejectValue: string }
>("logistics/counterDeliveryOffer", async ({ offer_id, amount }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<DeliveryOffer>(`/logistics/offers/${offer_id}/counter`, {
      amount,
    });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to counter delivery offer"));
  }
});

const offerAction = (path: string, fallback: string) =>
  createAsyncThunk<DeliveryOffer, string, { rejectValue: string }>(
    `logistics/${path}`,
    async (offer_id, { rejectWithValue }) => {
      try {
        const { data } = await api.patch<DeliveryOffer>(`/logistics/offers/${offer_id}/${path}`);
        return data;
      } catch (error) {
        return rejectWithValue(getApiErrorMessage(error, fallback));
      }
    }
  );

export const acceptDeliveryOffer = offerAction("accept", "Failed to accept delivery offer");
export const riderAcceptCounterOffer = offerAction(
  "rider-accept",
  "Failed to accept customer counter"
);
export const rejectDeliveryOffer = offerAction("reject", "Failed to reject delivery offer");
