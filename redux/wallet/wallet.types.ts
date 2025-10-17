export type WalletStatus = "idle" | "loading" | "succeeded" | "failed";

export type Bank = {
  id: string;
  name: string;       // e.g. "Access Bank"
  code: string;       // e.g. "044"
  created_at: string;
  updated_at: string | null;
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
};

export type ResolveAccountResponse = {
  account_name: string;
};

export type WalletProfile = {
  id: string;
  owner_id: string;
  balance: string;
  metadata: {
    backend?: {
      customer?: { id?: string; code?: string };
      dedicated_account?: unknown | null;
    };
    [k: string]: any;
  } | null;
  created_at: string;
  updated_at: string | null;
};

export type CreateBankAccountPayload = {
  account_number: string;
  bank_code: string;
  bvn: string;
};

export type TopupPayload = {
  amount: number;
};

export type TopupResponse = {
  url: string;
};

export type WithdrawPayload = {
  account_number: string;
  bank_code: string;
  account_name: string;
  amount: number;
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
