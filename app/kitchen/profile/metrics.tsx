import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorSummary } from "@/utils/mock/mockVendor";

export default function KitchenMetricsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Metrics
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {[
          { label: "Today", value: mockVendorSummary.today },
          { label: "Yesterday", value: mockVendorSummary.yesterday },
          { label: "Last 14 Days", value: mockVendorSummary.last14 },
          { label: "Last 30 Days", value: mockVendorSummary.last30 },
        ].map((item) => (
          <View
            key={item.label}
            className={`rounded-2xl p-4 mb-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {item.label}
            </Text>
            <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {item.value}
            </Text>
          </View>
        ))}

        <View
          className={`rounded-2xl p-4 mt-2 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Charts
          </Text>
          <View className={`h-40 rounded-2xl mt-3 items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              Chart placeholder
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
