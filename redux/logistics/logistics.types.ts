export type LogisticsStatus = "idle" | "loading" | "succeeded" | "failed";

export type PaginationMeta = { page: number; per_page: number; total: number };

export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "AWAITING_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type OfferStatus = "PENDING" | "COUNTERED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type LogisticsCompany = {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone_number: string;
  address: unknown;
  verification_status: VerificationStatus;
  operations_manager_id?: string;
  created_at: number | string;
  updated_at: number | string | null;
  kyc?: unknown;
  admin?: unknown;
};

export type LogisticsRider = {
  id: string;
  user_id: string;
  logistics_company_id: string | null;
  is_available: boolean;
  is_blocked: boolean;
  created_at: number | string;
  updated_at: number | string | null;
  logistics_company?: LogisticsCompany | null;
  kyc?: RiderKyc | null;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  };
};

export type RiderKyc = {
  id: string;
  rider_id: string;
  id_type: string;
  id_number: string;
  id_document_id: string;
  vehicle_type: string;
  vehicle_registration_number: string;
  next_of_kin_full_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone_number: string;
  next_of_kin_address: string;
  verification_status: VerificationStatus;
  verified_at: number | string | null;
  verified_by: string | null;
  created_at: number | string;
  updated_at: number | string | null;
  id_document?: unknown;
};

export type Delivery = {
  id: string;
  order_id?: string;
  rider_id?: string | null;
  delivery_status: DeliveryStatus;
  delivery_address?: string;
  pickup_address?: string;
  dropoff_address?: string;
  delivery_fee?: number | string;
  customer_notes?: string | null;
  rider_notes?: string | null;
  earning?: {
    amount?: number | string;
    [key: string]: unknown;
  } | null;
  created_at: number | string;
  updated_at: number | string | null;
  order?: any;
  rider?: LogisticsRider | null;
  [key: string]: unknown;
};

export type DeliveryOffer = {
  id: string;
  order_id: string;
  rider_id: string;
  amount: number;
  status: OfferStatus;
  created_at: number | string;
  updated_at: number | string | null;
};

export type ListQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  before?: string;
  after?: string;
};

export type FetchRidersQuery = ListQuery & {
  logistics_company_id?: string;
  is_available?: boolean;
};

export type FetchDeliveriesQuery = ListQuery & {
  rider_id?: string;
  delivery_status?: DeliveryStatus;
};

export type CreateRiderPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export type SubmitRiderKycPayload = {
  rider_id: string;
  id_type: string;
  id_number: string;
  id_document_id: string;
  vehicle_type: string;
  vehicle_registration_number: string;
  next_of_kin_full_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone_number: string;
  next_of_kin_address: string;
};

export type CreateCompanyPayload = {
  name: string;
  registration_number: string;
  email: string;
  phone_number: string;
  address: unknown;
};

export type SubmitCompanyKycPayload = {
  company_id: string;
  cac_certificate_id: string;
  tin_tax_record_id: string;
  insurance_cover_id: string;
};

export type VerifyKycPayload = {
  kyc_id: string;
  verification_status: "VERIFIED" | "REJECTED";
};

export type LogisticsState = {
  riders: Record<string, LogisticsRider>;
  riderOrder: string[];
  riderMeta: PaginationMeta | null;
  riderProfile: LogisticsRider | null;
  companies: Record<string, LogisticsCompany>;
  companyOrder: string[];
  companyMeta: PaginationMeta | null;
  deliveries: Record<string, Delivery>;
  deliveryOrder: string[];
  deliveryMeta: PaginationMeta | null;
  offersByOrder: Record<string, string[]>;
  offers: Record<string, DeliveryOffer>;
  listStatus: LogisticsStatus;
  mutationStatus: LogisticsStatus;
  error: string | null;
};
