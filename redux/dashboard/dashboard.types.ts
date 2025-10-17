export type DashboardStatus = "idle" | "loading" | "succeeded" | "failed";

export type DashboardInfo = {
  kitchens: number;
  meals: number;
  orders: number;
  transactions: number;
};

export type AnalyticsDirection = "INCOMING" | "OUTGOING";

export type AnalyticsItem = {
  id: string;
  amount: string;
  created_at: string;
  updated_at: string | null;
  direction: AnalyticsDirection;
  ref: string;
  note: string | null;
  user_id: string;
  wallet_id: string;
  purpose: {
    type: "ORDER" | string;
    order_id?: string;
  };
};

export type AnalyticsMeta = {
  page: number;
  per_page: number;
  total: number;
};

export type AnalyticsResponse = {
  data: {
    items: AnalyticsItem[];
    meta: AnalyticsMeta;
  };
  total: string;
};

export type AnalyticsType = "total";

export type DashboardState = {
  info: DashboardInfo | null;
  infoStatus: DashboardStatus;

  analytics: AnalyticsItem[];
  analyticsMeta: AnalyticsMeta | null;
  analyticsTotal: string | null;
  analyticsType: AnalyticsType | null;
  analyticsStatus: DashboardStatus;

  error: string | null;
};
