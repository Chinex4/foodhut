import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenReviewsScreen() {
  const { isDark, kitchen, orders, ordersStatus } = useKitchenData({ ordersStatus: null });
  const palette = getKitchenPalette(isDark);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED"),
    [orders]
  );
  const avgRating = Number(kitchen?.rating || 0);

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
              {avgRating.toFixed(1)}
            </Text>
            <View className="flex-row items-center ml-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.round(avgRating) ? "star" : "star-outline"}
                  size={16}
                  color={palette.accent}
                />
              ))}
            </View>
          </View>
          <Text className="text-[13px] mt-1" style={{ color: palette.textSecondary }}>
            Based on delivered order activity
          </Text>
        </View>

        {ordersStatus === "loading" && !deliveredOrders.length ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : null}

        {deliveredOrders.map((order) => (
          <View
            key={order.id}
            className="rounded-3xl p-4 mb-3"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                {order.owner.first_name} {order.owner.last_name}
              </Text>
              <Text className="text-[12px]" style={{ color: palette.textMuted }}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.round(avgRating || 0) ? "star" : "star-outline"}
                  size={14}
                  color={index < Math.round(avgRating || 0) ? palette.accent : palette.textMuted}
                />
              ))}
            </View>

            <Text className="mt-2 text-[14px]" style={{ color: palette.textSecondary }}>
              {order.dispatch_rider_note || "Order delivered successfully."}
            </Text>
          </View>
        ))}

        {!deliveredOrders.length && ordersStatus !== "loading" ? (
          <View
            className="rounded-3xl p-5 items-center"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Text style={{ color: palette.textSecondary }}>
              No delivered orders yet.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
