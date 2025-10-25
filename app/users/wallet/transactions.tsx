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
import { formatNGN } from "@/utils/money";

// ---- Types you can mirror from your API later
type TxKind = "CREDIT" | "DEBIT";
type Transaction = {
  id: string;
  title: string;
  ref?: string;
  kind: TxKind;
  amount: number; // NGN
  created_at: string; // ISO
};

// ---- MOCK: replace this with API data later
const makeMock = (page: number): Transaction[] =>
  Array.from({ length: 10 }).map((_, i) => {
    const idx = (page - 1) * 10 + i + 1;
    const kind: TxKind = idx % 3 === 0 ? "CREDIT" : "DEBIT";
    return {
      id: `tx_${idx}`,
      title: kind === "CREDIT" ? "Wallet Top-up" : "Beans & Plantain",
      ref: `FH-${String(idx).padStart(6, "0")}`,
      kind,
      amount: kind === "CREDIT" ? 5000 + (idx % 5) * 250 : 6500,
      created_at: new Date(Date.now() - idx * 36e5).toISOString(),
    };
  });

export default function WalletTransactionsScreen() {
  const router = useRouter();

  // --- local paging state (swap for Redux when you wire API)
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Transaction[]>(() => makeMock(1));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // filters
  const [tab, setTab] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  const data = useMemo(() => {
    if (tab === "ALL") return items;
    return items.filter((t) => t.kind === tab);
  }, [items, tab]);

  // --- handlers you’ll replace with real thunks later
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: dispatch(fetchTransactions({ page: 1 }))
      const next = makeMock(1);
      setItems(next);
      setPage(1);
      setHasMore(true); // or payload.meta.has_more
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      // TODO: dispatch(fetchTransactions({ page: page + 1 }))
      const nextPage = page + 1;
      const next = makeMock(nextPage);
      if (!next.length) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...next]);
        setPage(nextPage);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.kind === "CREDIT";
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
            <Text className="text-neutral-900 font-satoshiMedium">
              {item.title}
            </Text>
            <Text className="text-neutral-500 font-satoshi text-[12px]">
              {new Date(item.created_at).toLocaleString()}{" "}
              {item.ref ? `• ${item.ref}` : ""}
            </Text>
          </View>
        </View>

        <Text
          className={`font-satoshiBold ${isCredit ? "text-green-600" : "text-neutral-900"}`}
        >
          {isCredit ? "+" : "-"}
          {formatNGN(item.amount)}
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
                className={`flex-1 py-2 rounded-lg items-center justify-center ${
                  active ? "bg-primary" : ""
                }`}
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
        data={data}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListEmptyComponent={
          <View className="px-5 mt-10 items-center">
            <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
            <Text className="mt-2 text-neutral-500 font-satoshi">
              No transactions yet.
            </Text>
          </View>
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
