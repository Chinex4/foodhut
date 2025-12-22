import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTopupLink } from "@/redux/wallet/wallet.thunks";
import {
  selectTopupStatus,
  selectTopupUrl,
} from "@/redux/wallet/wallet.selectors";
import { showError } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function KitchenTopupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const [amount, setAmount] = useState<string>("");

  const status = useAppSelector(selectTopupStatus);
  const url = useAppSelector(selectTopupUrl);

  const busy = status === "loading";
  const numeric = Number(amount.replace(/[^0-9.]/g, ""));
  const canTopup = !busy && numeric > 0;

  const handleTopup = async () => {
    try {
      await dispatch(
        createTopupLink({
          amount: Math.round(numeric),
          as_kitchen: true,
        })
      ).unwrap();
    } catch (e: any) {
      showError(e);
    }
  };

  useEffect(() => {
    const open = async () => {
      if (status === "succeeded" && url) {
        await WebBrowser.openBrowserAsync(url);
        router.back();
      }
    };
    open();
  }, [status, url, router]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable onPress={() => router.push("/kitchen/wallet")} className="mr-2">
            <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
          </Pressable>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Top Up Wallet
          </Text>
        </View>

        <View className="flex-1 px-5 mt-4">
          <View
            className={`rounded-2xl border px-3 py-4 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Input Amount"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </View>
        </View>

        <View className="px-5 pb-6">
          <Pressable
            disabled={!canTopup}
            onPress={handleTopup}
            className={`rounded-2xl py-4 items-center justify-center ${
              canTopup ? "bg-primary" : isDark ? "bg-neutral-800" : "bg-neutral-300"
            }`}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold">Top Up</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
