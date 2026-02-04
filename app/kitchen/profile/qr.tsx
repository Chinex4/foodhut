import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function KitchenQrScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          QR Code
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-56 h-56 rounded-3xl items-center justify-center border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
          <Ionicons name="qr-code-outline" size={60} color={isDark ? "#E5E7EB" : "#111827"} />
          <Text className={`text-[12px] mt-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            QR placeholder
          </Text>
        </View>

        <Pressable className="mt-6 bg-primary rounded-2xl px-6 py-3">
          <Text className="text-white font-satoshiBold">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}
