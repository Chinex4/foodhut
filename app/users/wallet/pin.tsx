import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { setWalletPin } from "@/redux/wallet/wallet.thunks";
import { selectSetWalletPinStatus } from "@/redux/wallet/wallet.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function UserWalletPinScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const status = useAppSelector(selectSetWalletPinStatus);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid = pin.length >= 4 && pin === confirm;

  const save = async () => {
    if (!valid) return;
    try {
      const res = await dispatch(setWalletPin({ pin })).unwrap();
      showSuccess(res.message);
      router.back();
    } catch (error: any) {
      showError(error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={24} color={isDark ? "#E5E7EB" : "#111827"} />
        </Pressable>
        <Text className={`text-[20px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Wallet PIN
        </Text>
      </View>

      <View className="px-5 pt-4">
        {[
          { label: "New PIN", value: pin, setter: setPin },
          { label: "Confirm PIN", value: confirm, setter: setConfirm },
        ].map((field) => (
          <View key={field.label} className="mb-4">
            <Text className={`mb-2 font-satoshiMedium ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={(value) => field.setter(value.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholder="Enter PIN"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`rounded-2xl px-4 py-4 font-satoshi ${
                isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
              }`}
            />
          </View>
        ))}
        {confirm.length > 0 && !valid ? (
          <Text className="text-red-500 mb-3">PINs must match and be at least 4 digits.</Text>
        ) : null}
        <Pressable
          onPress={save}
          disabled={!valid || status === "loading"}
          className={`rounded-2xl py-4 items-center ${valid ? "bg-primary" : "bg-neutral-400"}`}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold">Save PIN</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
