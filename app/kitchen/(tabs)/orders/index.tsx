import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorOrders, type VendorOrder } from "@/utils/mock/mockVendor";

type TabKey = "INCOMING" | "ONGOING" | "COMPLETED";

export default function KitchenOrdersScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [tab, setTab] = useState<TabKey>("INCOMING");
  const [orders, setOrders] = useState<VendorOrder[]>(mockVendorOrders);

  const filtered = useMemo(
    () => orders.filter((o) => o.status === tab),
    [orders, tab]
  );

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.status === "INCOMING") return { ...o, status: "ONGOING" };
        if (o.status === "ONGOING") return { ...o, status: "COMPLETED" };
        return o;
      })
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Orders
        </Text>
        <View className={`flex-row rounded-full p-1 mt-3 ${isDark ? "bg-neutral-800" : "bg-white"}`}>
          {(["INCOMING", "ONGOING", "COMPLETED"] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              className={`flex-1 px-3 py-2 rounded-full items-center ${tab === key ? "bg-primary" : ""}`}
            >
              <Text className={`text-[12px] font-satoshiMedium ${tab === key ? "text-white" : isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                {key === "INCOMING" ? "Incoming" : key === "ONGOING" ? "Ongoing" : "Completed"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-4">
          {filtered.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/kitchen/orders/${order.id}`)}
              className={`rounded-3xl p-4 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {order.id}
                </Text>
                <Text className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {order.time}
                </Text>
              </View>
              <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {order.customer} • {order.items.length} items
              </Text>
              <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Total: {order.total}
              </Text>
              {order.status !== "COMPLETED" && (
                <Pressable
                  onPress={() => advance(order.id)}
                  className="mt-3 rounded-2xl py-2 items-center bg-primary"
                >
                  <Text className="text-white font-satoshiBold">
                    {order.status === "INCOMING" ? "Move to Ongoing" : "Complete Order"}
                  </Text>
                </Pressable>
              )}
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <View className={`rounded-2xl p-4 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
              <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
                No orders in this tab.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
