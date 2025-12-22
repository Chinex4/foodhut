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

export default function KitchenWalletScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const balance = useAppSelector(selectWalletBalanceNumber);
  const profileStatus = useAppSelector(selectWalletProfileStatus);

  const items = useAppSelector(selectTransactionsList);
  const listStatus = useAppSelector(selectTransactionsListStatus);
  const error = useAppSelector(selectTransactionsError);
  const meta = useAppSelector(selectTransactionsMeta);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profileStatus === "idle")
      dispatch(fetchWalletProfile({ as_kitchen: true }));
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

  const preview = useMemo(() => items.slice(0, 5), [items]);

  const renderTx = ({ item }: { item: Transaction }) => {
    const isCredit = item.direction === "INCOMING";
    const label = item.note ?? (isCredit ? "Wallet Top-up" : "Order Payment");
    const amountNum = Number(item.amount);

    return (
      <View
        className={`rounded-2xl border px-3 py-4 mb-3 flex-row items-center justify-between ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
        }`}
        style={{
          shadowOpacity: 0.03,
          shadowRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={
              isCredit ? "arrow-down-circle-outline" : "arrow-up-circle-outline"
            }
            size={18}
            color={isCredit ? "#16a34a" : "#ef4444"}
          />
          <View className="ml-3">
            <Text
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              {label}
            </Text>
            <Text
              className={`text-[12px] font-satoshi ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
        <Text
          className={`font-satoshiMedium ${
            isCredit ? "text-green-600" : isDark ? "text-neutral-100" : "text-neutral-900"
          }`}
        >
          {isCredit ? "+" : "-"}
          {formatNGN(amountNum)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between gap-2">
          <Pressable
            onPress={() => router.push("/kitchen/(tabs)/index")}
            className="mr-2"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? "#E5E7EB" : "#0F172A"}
            />
          </Pressable>
          <Text
            className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Wallet
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="px-5 mt-2">
        <View className={`rounded-2xl p-5 ${isDark ? "bg-neutral-900" : "bg-neutral-900"}`}>
          <View className="flex-row items-center justify-between">
            <Text className="text-white/80 font-satoshi">Available Balance</Text>

            <Pressable
              onPress={() => router.push("/kitchen/wallet/transactions")}
            >
              <Text className="text-white/80 font-satoshiMedium">
                Transactions ›
              </Text>
            </Pressable>
          </View>

          <Text className="text-white text-[28px] font-satoshiBold mt-2">
            {formatNGN(balance)}
          </Text>

          <Pressable
            onPress={() => router.push("/kitchen/wallet/topup")}
            className="mt-4 bg-primary rounded-xl py-3 items-center justify-center border border-primary-500"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text className="ml-2 text-white font-satoshiBold">Add Money</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/kitchen/wallet/withdraw")}
            className={`mt-3 rounded-xl py-3 items-center justify-center border ${
              isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="cash-outline"
                size={18}
                color={isDark ? "#E5E7EB" : "#0F172A"}
              />
              <Text className={`ml-2 font-satoshiBold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                Withdraw
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="px-5 mt-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`font-satoshiBold ${isDark ? "text-neutral-300" : "text-neutral-500"}`}>
            Transaction History
          </Text>
          <Pressable onPress={() => router.push("/kitchen/wallet/transactions")}>
            <Text className="text-primary font-satoshiMedium">See all</Text>
          </Pressable>
        </View>

        <FlatList
          data={preview}
          keyExtractor={(x) => x.id}
          renderItem={renderTx}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            listStatus === "loading" ? (
              <View className="mt-6 items-center">
                <ActivityIndicator color="#0F172A" />
                <Text className={`mt-2 font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-500"}`}>
                  Loading transactions…
                </Text>
              </View>
            ) : error ? (
              <View className="mt-6 items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={36}
                  color="#ef4444"
                />
                <Text className={`mt-2 text-red-500 font-satoshi`}>
                  {error}
                </Text>
              </View>
            ) : (
              <View className="mt-6 items-center">
                <Ionicons
                  name="wallet-outline"
                  size={36}
                  color={isDark ? "#9CA3AF" : "#E5E7EB"}
                />
                <Text className={`mt-2 font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-500"}`}>
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
