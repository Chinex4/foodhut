import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showSuccess } from "@/components/ui/toast";

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  return (
    <View
      className={`rounded-2xl border px-3 py-4 flex-row items-center mb-3 ${
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-white border-neutral-200"
      }`}
    >
      {icon}
      <View className="ml-3 flex-1">{children}</View>
    </View>
  );
}

export default function RiderWithdrawScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const canWithdraw =
    bankName.trim().length > 0 &&
    accountNumber.trim().length >= 10 &&
    Number(amount.replace(/[^0-9.]/g, "")) > 0;

  const handleWithdraw = () => {
    if (!canWithdraw) return;
    showSuccess("Withdrawal request submitted.");
    router.back();
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable onPress={() => router.push("/riders/wallet")} className="mr-2">
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? "#E5E7EB" : "#0F172A"}
            />
          </Pressable>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Withdraw
          </Text>
        </View>

        <View className="flex-1 px-5 mt-2">
          <Field icon={<Ionicons name="business-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Bank name"
              value={bankName}
              onChangeText={setBankName}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Field icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Field icon={<Ionicons name="cash-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Pressable
            onPress={handleWithdraw}
            disabled={!canWithdraw}
            className={`mt-2 rounded-2xl py-3 items-center ${
              canWithdraw ? "bg-primary" : "bg-neutral-400"
            }`}
          >
            <Text className="text-white font-satoshiBold">Withdraw Funds</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
