import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { persistThemePreference, setThemeMode } from "@/redux/theme/theme.slice";
import {
  mockVendorMeals,
  mockVendorOrders,
  mockVendorSummary,
} from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

const performanceItems = [
  { label: "TODAY'S ORDERS", value: "24", trend: "up" as const },
  { label: "YESTERDAY", value: "18", trend: "flat" as const },
  { label: "LAST 14 DAYS", value: "342", trend: "up" as const },
  { label: "LAST 30 DAYS", value: "718", trend: "up" as const },
];

export default function KitchenDashboardScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const topMeals = mockVendorMeals.slice(0, 3);
  const incoming = mockVendorOrders.filter((o) => o.status === "INCOMING").slice(0, 2);
  const outOfStockCount = mockVendorMeals.filter((meal) => !meal.available || meal.stock <= 2).length;

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.accent }}
            >
              <Text className="text-white text-[20px] font-satoshiBold">V</Text>
            </View>

            <View className="ml-3">
              <Text
                className="text-[22px] leading-[28px] font-satoshiBold"
                style={{ color: palette.textPrimary }}
              >
                Gourmet Hub
              </Text>
              <Text
                className="text-[14px] tracking-[2px] font-satoshiMedium"
                style={{ color: palette.textSecondary }}
              >
                VENDOR DASHBOARD
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Pressable
              onPress={toggleTheme}
              className="w-11 h-11 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={palette.textPrimary}
              />
            </Pressable>

            <Pressable
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Ionicons name="notifications" size={19} color={palette.textPrimary} />
              <View
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#FB7185" }}
              />
            </Pressable>
          </View>
        </View>

        <View
          className="rounded-[30px] mt-7 p-6"
          style={{ backgroundColor: palette.accent }}
        >
          <Text className="text-[17px] font-satoshiMedium text-white/85">Total Wallet Balance</Text>

          <View className="flex-row items-center mt-2">
            <Text className="text-[32px] leading-[38px] font-satoshiBold text-white">
              {mockVendorSummary.wallet}
            </Text>
            <View
              className="ml-3 rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text className="text-white font-satoshiBold text-[14px]">+12.5%</Text>
            </View>
          </View>

          <View className="flex-row mt-6">
            <Pressable
              onPress={() => router.push("/kitchen/wallet/withdraw")}
              className="flex-1 rounded-2xl py-4 items-center justify-center mr-2"
              style={{ backgroundColor: palette.surface }}
            >
              <Text className="font-satoshiBold text-[17px]" style={{ color: palette.accentStrong }}>
                Withdraw
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/kitchen/wallet/transactions")}
              className="flex-1 rounded-2xl py-4 items-center justify-center ml-2"
              style={{ borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)" }}
            >
              <Text className="font-satoshiBold text-[17px] text-white">History</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text
            className="text-[20px] leading-[26px] font-satoshiBold"
            style={{ color: palette.textPrimary }}
          >
            Performance Stats
          </Text>
          <View
            className="rounded-xl px-3 py-1"
            style={{ backgroundColor: palette.accentSoft }}
          >
            <Text className="font-satoshiBold text-[12px]" style={{ color: palette.accentStrong }}>
              REAL-TIME
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between mt-3">
          {performanceItems.map((item) => (
            <View
              key={item.label}
              className="w-[48.5%] rounded-3xl p-4 mb-3"
              style={{
                backgroundColor: palette.surfaceAlt,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <Text className="text-[12px] font-satoshiBold" style={{ color: palette.textSecondary }}>
                {item.label}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text
                  className="text-[20px] leading-[24px] font-satoshiBold"
                  style={{ color: palette.textPrimary }}
                >
                  {item.value}
                </Text>
                <Ionicons
                  name={item.trend === "up" ? "arrow-up" : "remove"}
                  size={18}
                  color={item.trend === "up" ? palette.success : palette.textMuted}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>
          ))}
        </View>

        <View
          className="rounded-3xl mt-2 p-5"
          style={{
            backgroundColor: isDark ? palette.surfaceAlt : "#FFF4DE",
            borderWidth: 1,
            borderColor: isDark ? palette.border : "#FFD293",
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: isDark ? palette.accentSoft : "#FFE8B8" }}
            >
              <Ionicons name="alert" size={16} color={palette.accentStrong} />
            </View>
            <Text className="ml-3 text-[16px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              Action Required
            </Text>
          </View>

          <Text className="mt-3 text-[15px] leading-[24px]" style={{ color: palette.textSecondary }}>
            You have
            <Text className="font-satoshiBold" style={{ color: palette.textPrimary }}>
              {` ${outOfStockCount} menus `}
            </Text>
            out of stock. Update your inventory to continue receiving orders.
          </Text>

          <Pressable onPress={() => router.push("/kitchen/(tabs)/menu")}> 
            <Text className="mt-4 text-[17px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              View Inventory
            </Text>
          </Pressable>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text
            className="text-[20px] leading-[26px] font-satoshiBold"
            style={{ color: palette.textPrimary }}
          >
            Incoming Orders
          </Text>
          <Pressable onPress={() => router.push("/kitchen/(tabs)/orders")}> 
            <Text className="text-[16px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              View All
            </Text>
          </Pressable>
        </View>

        {incoming.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => router.push(`/kitchen/orders/${order.id}`)}
            className="rounded-3xl mt-3 p-4"
            style={{
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: isDark ? palette.accentSoft : "#FFF1D3" }}
                >
                  <Ionicons name="bag-handle" size={22} color={palette.accentStrong} />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                    Order {order.id}
                  </Text>
                  <Text className="text-[13px]" style={{ color: palette.textSecondary }}>
                    {order.items.length} Items • {order.time}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="font-satoshiBold text-[18px]" style={{ color: palette.textPrimary }}>
                  {order.total}
                </Text>
                <View
                  className="rounded-full px-3 py-1 mt-1"
                  style={{ backgroundColor: isDark ? palette.accentSoft : "#FFF3DB" }}
                >
                  <Text className="font-satoshiBold text-[12px]" style={{ color: palette.accentStrong }}>
                    NEW
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        <Text
          className="mt-8 text-[20px] leading-[26px] font-satoshiBold"
          style={{ color: palette.textPrimary }}
        >
          Most Ordered Food
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {topMeals.map((meal, idx) => (
            <Pressable
              key={meal.id}
              onPress={() => router.push("/kitchen/(tabs)/menu")}
              className="mr-3 rounded-3xl overflow-hidden"
              style={{
                width: 235,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <View
                className="h-36 items-center justify-center"
                style={{
                  backgroundColor:
                    idx === 0
                      ? "#4C8B65"
                      : idx === 1
                      ? "#EBEEF2"
                      : isDark
                      ? palette.elevated
                      : "#ECF7F8",
                }}
              >
                <Ionicons
                  name={idx === 0 ? "leaf" : idx === 1 ? "nutrition" : "fast-food"}
                  size={40}
                  color={idx === 0 ? "#E0F2E7" : idx === 1 ? "#6B7280" : palette.accentStrong}
                />
                <View
                  className="absolute top-3 right-3 rounded-full px-3 py-1"
                  style={{ backgroundColor: palette.accent }}
                >
                  <Text className="text-white text-[11px] font-satoshiBold">TOP {idx + 1}</Text>
                </View>
              </View>

              <View className="p-4">
                <Text
                  className="text-[16px] font-satoshiBold"
                  style={{ color: palette.textPrimary }}
                  numberOfLines={1}
                >
                  {meal.name}
                </Text>
                <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
                  {142 - idx * 24} orders this month
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
