import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";

const mockTransactions = [
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
];

export default function RiderWalletScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [refreshing, setRefreshing] = useState(false);

  const preview = useMemo(() => mockTransactions.slice(0, 4), []);
  const balance = 28500.5;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between gap-2">
          <Pressable onPress={() => router.push("/riders/(tabs)/index")} className="mr-2">
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? "#E5E7EB" : "#0F172A"}
            />
          </Pressable>
          <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Wallet
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="px-5 mt-2">
        <View className="rounded-2xl p-5 bg-neutral-900">
          <View className="flex-row items-center justify-between">
            <Text className="text-white/80 font-satoshi">Available Balance</Text>

            <Pressable onPress={() => router.push("/riders/wallet/transactions")}>
              <Text className="text-white/80 font-satoshiMedium">
                Transactions ›
              </Text>
            </Pressable>
          </View>

          <Text className="text-white text-[28px] font-satoshiBold mt-2">
            {formatNGN(balance)}
          </Text>

          <Pressable
            onPress={() => router.push("/riders/wallet/withdraw")}
            className="mt-4 bg-primary rounded-xl py-3 items-center justify-center border border-primary-500"
          >
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text className="ml-2 text-white font-satoshiBold">Withdraw</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="px-5 mt-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`font-satoshiBold ${isDark ? "text-neutral-300" : "text-neutral-500"}`}>
            Recent Transactions
          </Text>
          <Pressable onPress={() => router.push("/riders/wallet/transactions")}>
            <Text className="text-primary font-satoshiMedium">See all</Text>
          </Pressable>
        </View>

        <FlatList
          data={preview}
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
                    size={18}
                    color={isCredit ? "#16a34a" : "#ef4444"}
                  />
                  <View className="ml-3">
                    <Text className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {item.note}
                    </Text>
                    <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
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
                  {formatNGN(item.amount)}
                </Text>
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
        />
      </View>
    </SafeAreaView>
  );
}
