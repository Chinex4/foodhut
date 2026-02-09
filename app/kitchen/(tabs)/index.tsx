import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  mockVendorOrders,
  mockVendorSummary,
  mockVendorMeals,
} from "@/utils/mock/mockVendor";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function KitchenDashboardScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const topMeals = mockVendorMeals.slice(0, 3);
  const incoming = mockVendorOrders.filter((o) => o.status === "INCOMING");

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Kitchen Dashboard
        </Text>
        <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Track sales, orders, and performance.
        </Text>

        <View className="mt-4">
          {["today", "yesterday", "last14", "last30"].map((key) => (
            <View
              key={key}
              className={`rounded-2xl p-4 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {key === "today"
                  ? "Today"
                  : key === "yesterday"
                    ? "Yesterday"
                    : key === "last14"
                      ? "Last 14 Days"
                      : "Last 30 Days"}
              </Text>
              <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {mockVendorSummary[key as keyof typeof mockVendorSummary]}
              </Text>
            </View>
          ))}
        </View>

        <View
          className={`rounded-2xl p-4 mb-5 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Wallet Balance
          </Text>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {mockVendorSummary.wallet}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <Text className={`text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Most Ordered Meals
          </Text>
          <Pressable onPress={() => router.push("/kitchen/(tabs)/menu")}
          >
            <Text className="text-primary text-[12px] font-satoshiMedium">View Menu</Text>
          </Pressable>
        </View>
        {topMeals.map((meal) => (
          <View
            key={meal.id}
            className={`rounded-2xl p-4 mb-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {meal.name}
            </Text>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {meal.description}
            </Text>
          </View>
        ))}

        <View className="flex-row items-center justify-between mt-4 mb-2">
          <Text className={`text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Incoming Orders
          </Text>
          <Pressable onPress={() => router.push("/kitchen/(tabs)/orders")}
          >
            <Text className="text-primary text-[12px] font-satoshiMedium">See all</Text>
          </Pressable>
        </View>
        {incoming.length ? (
          incoming.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/kitchen/orders/${order.id}`)}
              className={`rounded-2xl p-4 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {order.id}
                </Text>
                <View className="px-2 py-1 rounded-full bg-amber-100">
                  <Text className="text-[10px] font-satoshiBold text-amber-700">
                    Incoming
                  </Text>
                </View>
              </View>
              <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {order.customer} • {order.items.length} items • {order.total}
              </Text>
            </Pressable>
          ))
        ) : (
          <View className={`rounded-2xl p-4 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
            <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              No incoming orders right now.
            </Text>
          </View>
        )}

        <View
          className={`rounded-2xl p-4 mt-4 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View className="flex-row items-center">
            <Ionicons name="bulb-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
            <Text className={`ml-2 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Tip: Update your menu daily to boost orders.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
