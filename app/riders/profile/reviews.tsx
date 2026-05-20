import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function RiderReviewsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Reviews
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          className={`rounded-2xl p-5 border items-center ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Ionicons name="star-outline" size={36} color={isDark ? "#6B7280" : "#D1D5DB"} />
          <Text className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
            No reviews yet
          </Text>
          <Text className={`mt-1 text-center text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Rider reviews will appear here when the reviews endpoint is available.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
