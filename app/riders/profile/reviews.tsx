import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockRiderReviews } from "@/utils/mock/mockRider";

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
        {mockRiderReviews.map((review) => (
          <View
            key={review.id}
            className={`rounded-2xl p-4 mb-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {review.name}
              </Text>
              <Text className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {review.date}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < review.rating ? "star" : "star-outline"}
                  size={14}
                  color={i < review.rating ? "#F59E0B" : isDark ? "#4B5563" : "#D1D5DB"}
                />
              ))}
            </View>
            <Text className={`mt-2 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {review.comment}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
