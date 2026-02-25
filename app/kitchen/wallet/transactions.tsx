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
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

type TabKey = "ALL" | "CREDIT" | "DEBIT";

export default function KitchenWalletTransactionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const items = useAppSelector(selectTransactionsList);
  const meta = useAppSelector(selectTransactionsMeta);
  const listStatus = useAppSelector(selectTransactionsListStatus);
  const error = useAppSelector(selectTransactionsError);

  const [tab, setTab] = useState<TabKey>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  React.useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchTransactions({ page: 1, per_page: 20, as_kitchen: true }));
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = (meta?.page ?? 1) + 1;
      await dispatch(
        fetchTransactions({
          page: nextPage,
          per_page: meta?.per_page ?? 20,
          as_kitchen: true,
        })
      ).unwrap();
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, loadingMore, hasMore, meta?.page, meta?.per_page]);

  const filtered = useMemo(() => {
    if (tab === "ALL") return items;
    const wantIncoming = tab === "CREDIT";
    return items.filter((tx) =>
      wantIncoming ? tx.direction === "INCOMING" : tx.direction === "OUTGOING"
    );
  }, [items, tab]);

  const renderItem = ({ item }: { item: Transaction }) => {
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

      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable
          onPress={() => router.push("/kitchen/wallet")}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Transactions
        </Text>
      </View>

      <View className="px-5 mt-1 mb-3">
        <View className="flex-row rounded-full p-1" style={{ backgroundColor: palette.surfaceAlt }}>
          {(["ALL", "CREDIT", "DEBIT"] as const).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className="flex-1 py-2 rounded-full items-center justify-center"
                style={{ backgroundColor: active ? palette.accent : "transparent" }}
              >
                <Text
                  className="text-[13px] font-satoshiBold"
                  style={{ color: active ? "#fff" : palette.textSecondary }}
                >
                  {key === "ALL" ? "All" : key === "CREDIT" ? "Credit" : "Debit"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-3 items-center">
              <ActivityIndicator color={palette.accent} />
            </View>
          ) : null
        }
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
              <Ionicons name="alert-circle-outline" size={36} color={palette.danger} />
              <Text className="mt-2 text-center" style={{ color: palette.danger }}>
                {error}
              </Text>
            </View>
          ) : (
            <View className="mt-6 items-center">
              <Ionicons name="wallet-outline" size={36} color={palette.textMuted} />
              <Text className="mt-2" style={{ color: palette.textSecondary }}>
                No transactions yet
              </Text>
            </View>
          )
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}
