import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorReviews } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenReviewsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const avgRating = (
    mockVendorReviews.reduce((sum, review) => sum + review.rating, 0) /
    mockVendorReviews.length
  ).toFixed(1);

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
          Reviews
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-5 mb-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text className="text-[13px]" style={{ color: palette.textSecondary }}>
            Average Rating
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-[20px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              {avgRating}
            </Text>
            <View className="flex-row items-center ml-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.round(Number(avgRating)) ? "star" : "star-outline"}
                  size={16}
                  color={palette.accent}
                />
              ))}
            </View>
          </View>
          <Text className="text-[13px] mt-1" style={{ color: palette.textSecondary }}>
            Based on {mockVendorReviews.length} recent reviews
          </Text>
        </View>

        {mockVendorReviews.map((review) => (
          <View
            key={review.id}
            className="rounded-3xl p-4 mb-3"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                {review.name}
              </Text>
              <Text className="text-[12px]" style={{ color: palette.textMuted }}>
                {review.date}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < review.rating ? "star" : "star-outline"}
                  size={14}
                  color={index < review.rating ? palette.accent : palette.textMuted}
                />
              ))}
            </View>

            <Text className="mt-2 text-[14px]" style={{ color: palette.textSecondary }}>
              {review.comment}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
