import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showError, showSuccess } from "@/components/ui/toast";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { setWalletPin } from "@/redux/wallet/wallet.thunks";
import { selectSetWalletPinStatus } from "@/redux/wallet/wallet.selectors";

export default function KitchenWalletPasswordScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectSetWalletPinStatus);
  const palette = getKitchenPalette(isDark);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const isValid = password.length >= 4 && password === confirm;

  const handleSave = async () => {
    if (!isValid) return;
    try {
      const res = await dispatch(setWalletPin({ pin: password })).unwrap();
      showSuccess(res.message);
      router.back();
    } catch (error: any) {
      showError(error);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Wallet Security
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text className="text-[13px] mb-4" style={{ color: palette.textSecondary }}>
            Set a wallet PIN for withdrawals and sensitive wallet actions.
          </Text>

          <View className="mb-4">
            <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
              New PIN
            </Text>
            <TextInput
              value={password}
              onChangeText={(value) => setPassword(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter new PIN"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              className="rounded-2xl px-3 py-3 text-[15px] font-satoshi"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            />
          </View>

          <View>
            <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
              Confirm PIN
            </Text>
            <TextInput
              value={confirm}
              onChangeText={(value) => setConfirm(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Confirm PIN"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              className="rounded-2xl px-3 py-3 text-[15px] font-satoshi"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            />
          </View>

          {!isValid && confirm.length > 0 ? (
            <Text className="text-[12px] mt-2" style={{ color: palette.danger }}>
              PINs must match and be at least 4 digits.
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!isValid || status === "loading"}
          className="mt-5 rounded-2xl py-4 items-center"
          style={{ backgroundColor: isValid ? palette.accent : palette.textMuted }}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold">Save PIN</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
