import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorSummary } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

const bars = [42, 66, 78, 54, 84, 72, 90];

export default function KitchenMetricsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
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
          Business Metrics
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row flex-wrap justify-between">
          {[
            { label: "Today", value: mockVendorSummary.today },
            { label: "Yesterday", value: mockVendorSummary.yesterday },
            { label: "Last 14 Days", value: mockVendorSummary.last14 },
            { label: "Last 30 Days", value: mockVendorSummary.last30 },
          ].map((item) => (
            <View
              key={item.label}
              className="w-[48%] rounded-3xl p-4 mb-3"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
                {item.label}
              </Text>
              <Text className="text-[17px] mt-2 font-satoshiBold" style={{ color: palette.textPrimary }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="rounded-3xl p-5 mt-2" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
              Weekly Revenue Trend
            </Text>
            <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
              Last 7 days
            </Text>
          </View>

          <View className="mt-5 flex-row items-end justify-between h-36">
            {bars.map((value, index) => (
              <View key={index} className="items-center">
                <View
                  className="w-7 rounded-t-xl"
                  style={{
                    height: value,
                    backgroundColor: index === bars.length - 1 ? palette.accent : isDark ? palette.elevated : "#E5E7EB",
                  }}
                />
                <Text className="text-[10px] mt-2" style={{ color: palette.textMuted }}>
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
