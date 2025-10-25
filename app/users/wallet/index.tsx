import React, { useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import {
  selectWalletBalanceNumber,
  selectWalletProfileStatus,
} from "@/redux/wallet/wallet.selectors";
import { formatNGN } from "@/utils/money";

export default function WalletScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const balance = useAppSelector(selectWalletBalanceNumber);
  const profileStatus = useAppSelector(selectWalletProfileStatus);

  useEffect(() => {
    if (profileStatus === "idle") dispatch(fetchWalletProfile());
  }, [profileStatus, dispatch]);

  // TODO: Replace this with real transaction history when the API is ready
  const transactions: Array<{ id: string; title: string; amount: number }> = [];

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between gap-2">
          <Pressable
            onPress={() => router.push("/users/(tabs)/profile")}
            className="mr-2"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-2xl font-satoshiBold text-neutral-900">
            Wallet
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Balance Card */}
      <View className="px-5 mt-2">
        <View className="bg-neutral-900 rounded-2xl p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-white/80 font-satoshi">
              Available Balance
            </Text>
            <Pressable
              onPress={() => router.push("/users/wallet/transactions")}
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
            onPress={() => router.push("/users/wallet/topup")}
            className="mt-4 bg-primary rounded-xl py-3 items-center justify-center border border-primary-500"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text className="ml-2 text-white font-satoshiBold">
                Add Money
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/users/wallet/withdraw")}
            className="mt-3 bg-white rounded-xl py-3 items-center justify-center border border-neutral-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={18} color="#0F172A" />
              <Text className="ml-2 text-neutral-900 font-satoshiBold">
                Withdraw
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Transactions preview (placeholder list) */}
      <View className="px-5 mt-6">
        <Text className="text-neutral-500 font-satoshiBold mb-2">
          Transaction History
        </Text>
        <FlatList
          data={transactions}
          keyExtractor={(x) => x.id}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl border border-neutral-100 px-3 py-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#0F172A"
                />
                <Text className="ml-3 font-satoshi text-neutral-900">
                  {item.title}
                </Text>
              </View>
              <Text className="font-satoshiMedium text-neutral-900">
                {formatNGN(item.amount)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-neutral-500 font-satoshi">
              No transactions yet.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
}
