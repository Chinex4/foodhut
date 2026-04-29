import { api } from "@/api/axios";

export type WalletPointers = {
  user: string | null;
  kitchen: string | null;
  rider: string | null;
};

export type WalletType = "user" | "kitchen" | "rider" | "unknown";

export const fetchWalletPointers = async (): Promise<WalletPointers> => {
  const { data } = await api.get<WalletPointers & { id?: string }>("/wallets/profile");
  if (data?.id) {
    return {
      user: data.id,
      kitchen: null,
      rider: null,
    };
  }

  return {
    user: data?.user ?? null,
    kitchen: data?.kitchen ?? null,
    rider: data?.rider ?? null,
  };
};

export const pickWalletId = (
  pointers: WalletPointers,
  opts?: { as_kitchen?: boolean }
): { walletId: string | null; walletType: WalletType } => {
  if (opts?.as_kitchen && pointers.kitchen) {
    return { walletId: pointers.kitchen, walletType: "kitchen" };
  }

  if (!opts?.as_kitchen && pointers.user) {
    return { walletId: pointers.user, walletType: "user" };
  }

  if (pointers.kitchen) {
    return { walletId: pointers.kitchen, walletType: "kitchen" };
  }

  if (pointers.user) {
    return { walletId: pointers.user, walletType: "user" };
  }

  if (pointers.rider) {
    return { walletId: pointers.rider, walletType: "rider" };
  }

  return { walletId: null, walletType: "unknown" };
};
