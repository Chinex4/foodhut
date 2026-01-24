import React, { useMemo, useState } from "react";
import {
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
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { formatNGN } from "@/utils/money";

type Transaction = {
  id: string;
  direction: "INCOMING" | "OUTGOING";
  amount: number;
  note: string;
  created_at: string;
};

const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    direction: "INCOMING",
    amount: 3200,
    note: "Delivery payout",
    created_at: "2025-08-01T12:34:00Z",
  },
  {
    id: "tx_002",
    direction: "OUTGOING",
    amount: 1500,
    note: "Withdrawal to bank",
    created_at: "2025-07-31T09:12:00Z",
  },
  {
    id: "tx_003",
    direction: "INCOMING",
    amount: 4200,
    note: "Delivery payout",
    created_at: "2025-07-30T18:45:00Z",
  },
  {
    id: "tx_004",
    direction: "INCOMING",
    amount: 2800,
    note: "Delivery payout",
    created_at: "2025-07-29T14:20:00Z",
  },
];

type TabKey = "ALL" | "CREDIT" | "DEBIT";

export default function RiderWalletTransactionsScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [tab, setTab] = useState<TabKey>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "ALL") return mockTransactions;
    const wantIncoming = tab === "CREDIT";
    return mockTransactions.filter((t) =>
      wantIncoming ? t.direction === "INCOMING" : t.direction === "OUTGOING"
    );
  }, [tab]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <Pressable onPress={() => router.push("/riders/wallet")} className="mr-2">
          <Ionicons
            name="chevron-back"
            size={22}
            color={isDark ? "#E5E7EB" : "#0F172A"}
          />
        </Pressable>
        <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Transactions
        </Text>
      </View>

      <View className="px-5 mt-1 mb-3">
        <View className={`flex-row rounded-xl p-1 ${isDark ? "bg-neutral-800" : "bg-neutral-200/60"}`}>
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
                      : isDark
                        ? "text-neutral-300 font-satoshi"
                        : "text-neutral-600 font-satoshi"
                  }`}
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
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => {
          const isCredit = item.direction === "INCOMING";
          return (
            <View
              className={`rounded-2xl border px-3 py-4 mb-3 flex-row items-center justify-between ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={isCredit ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                  size={20}
                  color={isCredit ? "#16a34a" : "#ef4444"}
                />
                <View className="ml-3">
                  <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {item.note}
                  </Text>
                  <Text className={`font-satoshi text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>

              <Text className={`font-satoshiBold ${isCredit ? "text-green-600" : isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {isCredit ? "+" : "-"}
                {formatNGN(item.amount)}
              </Text>
            </View>
          );
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
        ListEmptyComponent={
          <View className="mt-6 items-center">
            <Ionicons name="wallet-outline" size={36} color={isDark ? "#9CA3AF" : "#E5E7EB"} />
            <Text className={`mt-2 font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-500"}`}>
              No transactions yet
            </Text>
          </View>
        }
        ListFooterComponent={null}
      />
    </SafeAreaView>
  );
}
