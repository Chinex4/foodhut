import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectWalletBalanceNumber,
  selectWalletProfileStatus,
} from "@/redux/wallet/wallet.selectors";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";

import {
  selectTransactionsError,
  selectTransactionsList,
  selectTransactionsListStatus,
  selectTransactionsMeta,
} from "@/redux/transactions/transactions.selectors";
import { fetchTransactions } from "@/redux/transactions/transactions.thunks";
import type { Transaction } from "@/redux/transactions/transactions.types";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenWalletScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const balance = useAppSelector(selectWalletBalanceNumber);
  const profileStatus = useAppSelector(selectWalletProfileStatus);

  const items = useAppSelector(selectTransactionsList);
  const listStatus = useAppSelector(selectTransactionsListStatus);
  const error = useAppSelector(selectTransactionsError);
  const meta = useAppSelector(selectTransactionsMeta);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profileStatus === "idle") {
      dispatch(fetchWalletProfile({ as_kitchen: true }));
    }
  }, [profileStatus, dispatch]);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchTransactions({ page: 1, per_page: 20, as_kitchen: true }));
    }
  }, [listStatus, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchTransactions({
          page: 1,
          per_page: meta?.per_page ?? 20,
          as_kitchen: true,
        })
      ).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, meta?.per_page]);

  const preview = useMemo(() => items.slice(0, 4), [items]);

  const renderTx = ({ item }: { item: Transaction }) => {
    const isCredit = item.direction === "INCOMING";
    const label = item.note ?? (isCredit ? "Wallet Top-up" : "Wallet Transfer");
    const amountNum = Number(item.amount);

    return (
      <View
        className="rounded-2xl px-4 py-4 mb-3 flex-row items-center justify-between"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <View className="flex-row items-center flex-1 pr-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: isCredit ? "#EAFBEF" : isDark ? palette.dangerSoft : "#FFF1F2" }}
          >
            <Ionicons
              name={isCredit ? "arrow-down" : "arrow-up"}
              size={16}
              color={isCredit ? palette.success : palette.danger}
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-satoshiBold text-[15px]" style={{ color: palette.textPrimary }} numberOfLines={1}>
              {label}
            </Text>
            <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text className="font-satoshiBold text-[15px]" style={{ color: isCredit ? palette.success : palette.textPrimary }}>
          {isCredit ? "+" : "-"}
          {formatNGN(amountNum)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push("/kitchen/(tabs)")}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Wallet
          </Text>
        </View>

        <Pressable onPress={() => router.push("/kitchen/wallet/transactions")}>
          <Text className="font-satoshiBold" style={{ color: palette.accentStrong }}>
            See all
          </Text>
        </Pressable>
      </View>

      <View className="px-5 mt-1">
        <View className="rounded-[28px] p-5" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white/85 font-satoshi">Available Balance</Text>
          <Text className="text-[32px] leading-[38px] text-white font-satoshiBold mt-2">
            {formatNGN(balance)}
          </Text>

          <View className="flex-row mt-4">
            <Pressable
              onPress={() => router.push("/kitchen/wallet/topup")}
              className="flex-1 rounded-2xl py-3 items-center justify-center mr-2"
              style={{ backgroundColor: "rgba(255,255,255,0.24)" }}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text className="ml-2 text-white font-satoshiBold">Add Money</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/kitchen/wallet/withdraw")}
              className="flex-1 rounded-2xl py-3 items-center justify-center ml-2"
              style={{ backgroundColor: palette.surface }}
            >
              <View className="flex-row items-center">
                <Ionicons name="cash" size={18} color={palette.accentStrong} />
                <Text className="ml-2 font-satoshiBold" style={{ color: palette.accentStrong }}>
                  Withdraw
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="px-5 mt-6">
        <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
          Recent Transactions
        </Text>

        <FlatList
          data={preview}
          keyExtractor={(item) => item.id}
          renderItem={renderTx}
          className="mt-3"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            listStatus === "loading" ? (
              <View className="mt-6 items-center">
                <ActivityIndicator color={palette.accent} />
                <Text className="mt-2" style={{ color: palette.textSecondary }}>
                  Loading transactions...
                </Text>
              </View>
            ) : error ? (
              <View className="mt-6 items-center">
                <Ionicons name="alert-circle-outline" size={34} color={palette.danger} />
                <Text className="mt-2 text-center" style={{ color: palette.danger }}>
                  {error}
                </Text>
              </View>
            ) : (
              <View className="mt-6 items-center">
                <Ionicons name="wallet-outline" size={34} color={palette.textMuted} />
                <Text className="mt-2" style={{ color: palette.textSecondary }}>
                  No transactions yet
                </Text>
              </View>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
