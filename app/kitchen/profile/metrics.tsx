import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectWalletBalanceNumber } from "@/redux/wallet/wallet.selectors";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { formatNGN } from "@/utils/money";

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export default function KitchenMetricsScreen() {
  const dispatch = useAppDispatch();
  const { isDark, orders, ordersStatus } = useKitchenData({ ordersStatus: null });
  const palette = getKitchenPalette(isDark);
  const walletBalance = useAppSelector(selectWalletBalanceNumber);

  useEffect(() => {
    dispatch(fetchWalletProfile({ as_kitchen: true }));
  }, [dispatch]);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED"),
    [orders]
  );

  const revenueByDays = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    const yesterdayStart = new Date(start);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const last14Start = new Date(start);
    last14Start.setDate(last14Start.getDate() - 13);
    const last30Start = new Date(start);
    last30Start.setDate(last30Start.getDate() - 29);

    let today = 0;
    let yesterday = 0;
    let last14 = 0;
    let last30 = 0;

    for (const order of deliveredOrders) {
      const createdAt = new Date(order.created_at);
      const amount = Number(order.total) || 0;

      if (createdAt >= start) today += amount;
      if (createdAt >= yesterdayStart && createdAt < start) yesterday += amount;
      if (createdAt >= last14Start) last14 += amount;
      if (createdAt >= last30Start) last30 += amount;
    }

    return { today, yesterday, last14, last30 };
  }, [deliveredOrders]);

  const weeklyBars = useMemo(() => {
    const now = new Date();
    const dailyTotals: number[] = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const dayStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const total = deliveredOrders.reduce((sum, order) => {
        const createdAt = new Date(order.created_at);
        if (createdAt >= dayStart && createdAt < dayEnd) {
          return sum + (Number(order.total) || 0);
        }
        return sum;
      }, 0);

      dailyTotals.push(total);
    }

    const max = Math.max(...dailyTotals, 1);
    return dailyTotals.map((value) => ({
      value,
      height: Math.max(10, Math.round((value / max) * 90)),
    }));
  }, [deliveredOrders]);

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
          Business Metrics
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {ordersStatus === "loading" && !orders.length ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : null}

        <View className="flex-row flex-wrap justify-between">
          {[
            { label: "Today", value: formatNGN(revenueByDays.today) },
            { label: "Yesterday", value: formatNGN(revenueByDays.yesterday) },
            { label: "Last 14 Days", value: formatNGN(revenueByDays.last14) },
            { label: "Last 30 Days", value: formatNGN(revenueByDays.last30) },
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

        <View className="rounded-3xl p-4 mt-2" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
            Wallet Balance
          </Text>
          <Text className="text-[22px] mt-1 font-satoshiBold" style={{ color: palette.textPrimary }}>
            {formatNGN(walletBalance)}
          </Text>
        </View>

        <View className="rounded-3xl p-5 mt-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
              Weekly Revenue Trend
            </Text>
            <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
              Last 7 days
            </Text>
          </View>

          <View className="mt-5 flex-row items-end justify-between h-36">
            {weeklyBars.map((bar, index) => (
              <View key={`${bar.value}-${index}`} className="items-center">
                <View
                  className="w-7 rounded-t-xl"
                  style={{
                    height: bar.height,
                    backgroundColor: index === weeklyBars.length - 1 ? palette.accent : isDark ? palette.elevated : "#E5E7EB",
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
    </SafeAreaView>
  );
}
