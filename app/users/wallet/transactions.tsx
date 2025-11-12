import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectTransactionsList,
  selectTransactionsMeta,
  selectTransactionsListStatus,
  selectTransactionsError,
} from "@/redux/transactions/transactions.selectors";
import { fetchTransactions } from "@/redux/transactions/transactions.thunks";
import { formatNGN } from "@/utils/money";
import type { Transaction } from "@/redux/transactions/transactions.types";

type TabKey = "ALL" | "CREDIT" | "DEBIT";

export default function WalletTransactionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // store
  const items = useAppSelector(selectTransactionsList);
  const meta = useAppSelector(selectTransactionsMeta);
  const listStatus = useAppSelector(selectTransactionsListStatus);
  const error = useAppSelector(selectTransactionsError);

  // local UI state
  const [tab, setTab] = useState<TabKey>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // initial load
  React.useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchTransactions({ page: 1, per_page: 20 }));
    }
  }, [listStatus, dispatch]);

  const hasMore = useMemo(() => {
    if (!meta) return false;
    return items.length < (meta.total ?? 0);
  }, [items.length, meta]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchTransactions({ page: 1, per_page: meta?.per_page ?? 20 })
      ).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, meta?.per_page]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = (meta?.page ?? 1) + 1;
      await dispatch(
        fetchTransactions({ page: nextPage, per_page: meta?.per_page ?? 20 })
      ).unwrap();
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, loadingMore, hasMore, meta?.page, meta?.per_page]);

  const filtered = useMemo(() => {
    if (tab === "ALL") return items;
    const wantIncoming = tab === "CREDIT";
    return items.filter((t) =>
      wantIncoming ? t.direction === "INCOMING" : t.direction === "OUTGOING"
    );
  }, [items, tab]);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.direction === "INCOMING";
    const label = item.note ?? (isCredit ? "Wallet Top-up" : "Order Payment");
    const amountNum = Number(item.amount);

    return (
      <View
        className="bg-white rounded-2xl border border-neutral-100 px-3 py-4 mb-3 flex-row items-center justify-between"
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
            size={20}
            color={isCredit ? "#16a34a" : "#ef4444"}
          />
          <View className="ml-3">
            <Text className="text-neutral-900 font-satoshiMedium">{label}</Text>
            <Text className="text-neutral-500 font-satoshi text-[12px]">
              {new Date(item.created_at).toLocaleString()} • {item.id}
            </Text>
          </View>
        </View>

        <Text
          className={`font-satoshiBold ${isCredit ? "text-green-600" : "text-neutral-900"}`}
        >
          {isCredit ? "+" : "-"}
          {formatNGN(amountNum)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <Text className="text-[18px] font-satoshiBold text-neutral-900">
          Transactions
        </Text>
      </View>

      {/* Segment / Filters */}
      <View className="px-5 mt-1 mb-3">
        <View className="flex-row bg-neutral-200/60 rounded-xl p-1">
          {(["ALL", "CREDIT", "DEBIT"] as const).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${active ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-[13px] ${
                    active
                      ? "text-white font-satoshiBold"
                      : "text-neutral-600 font-satoshi"
                  }`}
                >
                  {key === "ALL"
                    ? "All"
                    : key === "CREDIT"
                      ? "Credit"
                      : "Debit"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListEmptyComponent={
          listStatus === "loading" ? (
            <View className="px-5 mt-10 items-center">
              <ActivityIndicator color="#0F172A" />
              <Text className="mt-2 text-neutral-500 font-satoshi">
                Loading transactions…
              </Text>
            </View>
          ) : error ? (
            <View className="px-5 mt-10 items-center">
              <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
              <Text className="mt-2 text-neutral-500 font-satoshi">
                {error}
              </Text>
            </View>
          ) : (
            <View className="px-5 mt-10 items-center">
              <Ionicons
                name="document-text-outline"
                size={36}
                color="#9CA3AF"
              />
              <Text className="mt-2 text-neutral-500 font-satoshi">
                No transactions yet.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-3">
              <ActivityIndicator color="#0F172A" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
