import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenWalletPasswordScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSave = () => {
    if (!password || password !== confirm) return;
    showSuccess("Wallet password set");
    router.back();
  };

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Wallet Password
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className={`text-[12px] mb-4 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
          Set a wallet/finance password for withdrawals and sensitive actions.
        </Text>

        <View className="mb-4">
          <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            New password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            secureTextEntry
            className={`rounded-2xl px-3 py-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            }`}
          />
        </View>

        <View className="mb-6">
          <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            Confirm password
          </Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm password"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            secureTextEntry
            className={`rounded-2xl px-3 py-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            }`}
          />
        </View>

        <Pressable
          onPress={handleSave}
          className={`rounded-2xl py-4 items-center ${password && confirm && password === confirm ? "bg-primary" : "bg-primary/60"}`}
          disabled={!password || !confirm || password !== confirm}
        >
          <Text className="text-white font-satoshiBold">Save Password</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
