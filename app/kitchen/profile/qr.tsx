import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenQrScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-20 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Share Kitchen QR
        </Text>
      </View>

      <View className="flex-1 px-5 items-center justify-center">
        <View
          className="w-[250px] h-[250px] rounded-[30px] items-center justify-center"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <View
            className="w-[200px] h-[200px] rounded-2xl items-center justify-center"
            style={{ backgroundColor: isDark ? palette.elevated : "#F8FAFC" }}
          >
            <Ionicons name="qr-code" size={88} color={palette.textPrimary} />
          </View>
        </View>

        <Text className="mt-4 text-[13px] text-center" style={{ color: palette.textSecondary }}>
          Customers can scan this to quickly find your kitchen and place orders.
        </Text>

        <Pressable
          onPress={() => showSuccess("QR shared")}
          className="mt-6 rounded-2xl px-8 py-4"
          style={{ backgroundColor: palette.accent }}
        >
          <View className="flex-row items-center">
            <Ionicons name="share-social" size={18} color="#fff" />
            <Text className="ml-2 text-white font-satoshiBold text-[16px]">Share QR</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
