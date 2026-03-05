export type WalletStatus = "idle" | "loading" | "succeeded" | "failed";

export type Bank = {
  id: string;
  name: string;
  code: string;
  created_at: number | string;
  updated_at: number | string | null;
};

export type BanksQuery = {
  page?: number;
  per_page?: number;
  search?: string;
};

export type BanksListResponse = {
  items: Bank[];
  meta: { page: number; per_page: number; total: number };
};

export type ResolveAccountPayload = {
  account_number: string;
  bank_code: string;
  as_kitchen?: boolean;
};

export type ResolveAccountResponse = {
  account_name: string;
};

export type WalletProfile = {
  id: string;
  owner_id: string;
  balance: string;
  wallet_type?: "user" | "kitchen" | "rider" | "unknown";
  metadata: {
    user_wallet_id?: string | null;
    kitchen_wallet_id?: string | null;
    rider_wallet_id?: string | null;
    selected_wallet_id?: string | null;
    [k: string]: unknown;
  } | null;
  created_at: number | string;
  updated_at: number | string | null;
};

export type CreateBankAccountPayload = {
  account_number: string;
  bank_code: string;
  bvn?: string;
};

export type TopupPayload = {
  amount: number;
  as_kitchen?: boolean;
  wallet_id?: string;
};

export type TopupResponse = {
  url: string;
};

export type WithdrawPayload = {
  account_number: string;
  bank_code: string;
  account_name: string;
  amount: number | string;
  as_kitchen?: boolean;
  wallet_id?: string;
};

export type MessageResult = { message: string };

export type WalletState = {
  banks: Record<string, Bank>;
  banksOrder: string[];
  banksMeta: { page: number; per_page: number; total: number } | null;
  banksQuery: BanksQuery | null;
  banksStatus: WalletStatus;

  resolveStatus: WalletStatus;
  resolvedAccountName: string | null;

  profile: WalletProfile | null;
  profileStatus: WalletStatus;

  createBankAccountStatus: WalletStatus;
  lastCreateBankMessage: string | null;

  topupStatus: WalletStatus;
  topupUrl: string | null;

  withdrawStatus: WalletStatus;
  lastWithdrawMessage: string | null;

  error: string | null;
};
