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

export default function TopupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState<string>("");

  const status = useAppSelector(selectTopupStatus);
  const url = useAppSelector(selectTopupUrl);

  const busy = status === "loading";
  const numeric = Number(amount.replace(/[^0-9.]/g, ""));
  const canTopup = !busy && numeric > 0;

  const handleTopup = async () => {
    try {
      await dispatch(createTopupLink({ amount: Math.round(numeric) })).unwrap();
    } catch (e: any) {
      showError(e);
    }
  };

  // open hosted page when url arrives
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
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-[18px] font-satoshiBold text-neutral-900">
            Top Up Wallet
          </Text>
        </View>

        {/* Body */}
        <View className="flex-1 px-5 mt-4">
          <View className="bg-white rounded-2xl border border-neutral-200 px-3 py-4">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Input Amount"
              className="font-satoshi text-neutral-900"
            />
          </View>
        </View>

        {/* CTA */}
        <View className="px-5 pb-6">
          <Pressable
            disabled={!canTopup}
            onPress={handleTopup}
            className={`rounded-2xl py-4 items-center justify-center ${canTopup ? "bg-primary" : "bg-neutral-300"}`}
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
