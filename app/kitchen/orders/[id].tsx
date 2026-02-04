import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorOrders } from "@/utils/mock/mockVendor";

export default function KitchenOrderDetailsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useMemo(() => mockVendorOrders.find((o) => o.id === id), [id]);

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Order Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {order ? (
          <View
            className={`rounded-2xl p-4 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {order.id}
            </Text>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {order.customer} • {order.time}
            </Text>
            <View className="mt-3">
              {order.items.map((item) => (
                <View key={item.name} className="flex-row items-center justify-between mb-2">
                  <Text className={`${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                    {item.name} × {item.qty}
                  </Text>
                </View>
              ))}
            </View>
            <Text className={`mt-2 font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Total: {order.total}
            </Text>
          </View>
        ) : (
          <View className={`rounded-2xl p-4 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
            <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              Order not found.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
