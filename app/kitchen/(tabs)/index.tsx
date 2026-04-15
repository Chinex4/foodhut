import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { persistThemePreference, setThemeMode } from "@/redux/theme/theme.slice";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { showSuccess, showError } from "@/components/ui/toast";
import { updateOrderStatus } from "@/redux/orders/orders.thunks";
import { formatNGN } from "@/utils/money";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { selectWalletBalanceNumber, selectWalletProfileStatus } from "@/redux/wallet/wallet.selectors";
import CachedImageView from "@/components/ui/CachedImage";

export default function KitchenDashboardScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const { kitchen, kitchenStatus, meals, orders, refreshOrders } = useKitchenData({ ordersStatus: null });

  const walletBalance = useAppSelector(selectWalletBalanceNumber);
  const walletStatus = useAppSelector(selectWalletProfileStatus);

  React.useEffect(() => {
    if (walletStatus === "idle") {
      dispatch(fetchWalletProfile({ as_kitchen: true }));
    }
  }, [dispatch, walletStatus]);

  const incoming = useMemo(
    () => orders.filter((o) => o.status === "AWAITING_ACKNOWLEDGEMENT").slice(0, 2),
    [orders]
  );

  const topMeals = useMemo(
    () =>
      [...meals]
        .sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0))
        .slice(0, 3),
    [meals]
  );

  const outOfStockCount = useMemo(
    () => meals.filter((meal) => meal.is_available === false).length,
    [meals]
  );

  const performanceItems = useMemo(
    () => [
      {
        label: "INCOMING",
        value: String(orders.filter((o) => o.status === "AWAITING_ACKNOWLEDGEMENT").length),
      },
      {
        label: "ONGOING",
        value: String(orders.filter((o) => ["PREPARING", "IN_TRANSIT"].includes(o.status)).length),
      },
      {
        label: "DELIVERED",
        value: String(orders.filter((o) => o.status === "DELIVERED").length),
      },
      {
        label: "MEALS",
        value: String(meals.length),
      },
    ],
    [orders, meals.length]
  );

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId,
          status: "PREPARING",
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order accepted");
      await refreshOrders();
    } catch (error: any) {
      showError(error?.message || "Failed to accept order");
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId,
          status: "CANCELLED",
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order declined");
      await refreshOrders();
    } catch (error: any) {
      showError(error?.message || "Failed to decline order");
    }
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
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
              <Text className="text-[22px] leading-[28px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                {kitchen?.name || "Vendor"}
              </Text>
              <Text className="text-[14px] tracking-[2px] font-satoshiMedium" style={{ color: palette.textSecondary }}>
                VENDOR DASHBOARD
              </Text>
            </View>
          </View>

          <Pressable
            onPress={toggleTheme}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={palette.textPrimary} />
          </Pressable>
        </View>

        <View className="rounded-[30px] mt-7 p-6" style={{ backgroundColor: palette.accent }}>
          <Text className="text-[17px] font-satoshiMedium text-white/85">Total Wallet Balance</Text>
          <Text className="text-[32px] leading-[38px] font-satoshiBold text-white mt-2">
            {formatNGN(walletBalance)}
          </Text>

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
          <Text className="text-[20px] leading-[26px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Performance Stats
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between mt-3">
          {performanceItems.map((item) => (
            <View
              key={item.label}
              className="w-[48.5%] rounded-3xl p-4 mb-3"
              style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}
            >
              <Text className="text-[12px] font-satoshiBold" style={{ color: palette.textSecondary }}>
                {item.label}
              </Text>
              <Text className="text-[20px] leading-[24px] font-satoshiBold mt-2" style={{ color: palette.textPrimary }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="rounded-3xl mt-2 p-5" style={{ backgroundColor: isDark ? palette.surfaceAlt : "#FFF4DE", borderWidth: 1, borderColor: isDark ? palette.border : "#FFD293" }}>
          <View className="flex-row items-center">
            <Ionicons name="alert" size={16} color={palette.accentStrong} />
            <Text className="ml-3 text-[16px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              Action Required
            </Text>
          </View>

          <Text className="mt-3 text-[15px] leading-[24px]" style={{ color: palette.textSecondary }}>
            You have
            <Text className="font-satoshiBold" style={{ color: palette.textPrimary }}>
              {` ${outOfStockCount} menus `}
            </Text>
            out of stock.
          </Text>

          <Pressable onPress={() => router.push("/kitchen/(tabs)/menu")}>
            <Text className="mt-4 text-[17px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              View Inventory
            </Text>
          </Pressable>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-[20px] leading-[26px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Incoming Orders
          </Text>
          <Pressable onPress={() => router.push("/kitchen/(tabs)/orders")}> 
            <Text className="text-[16px] font-satoshiBold" style={{ color: palette.accentStrong }}>
              View All
            </Text>
          </Pressable>
        </View>

        {incoming.map((order) => (
          <View
            key={order.id}
            className="rounded-3xl mt-3 p-4"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Pressable onPress={() => router.push(`/kitchen/orders/${order.id}`)}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="text-[13px] mt-1" style={{ color: palette.textSecondary }}>
                    {order.items.length} Items
                  </Text>
                </View>

                <Text className="font-satoshiBold text-[18px]" style={{ color: palette.textPrimary }}>
                  {formatNGN(Number(order.total))}
                </Text>
              </View>
            </Pressable>

            <View className="mt-4 flex-row">
              <Pressable
                onPress={() => handleDeclineOrder(order.id)}
                className="flex-1 rounded-2xl py-3 items-center mr-2"
                style={{ backgroundColor: palette.surfaceAlt }}
              >
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  Decline
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleAcceptOrder(order.id)}
                className="flex-1 rounded-2xl py-3 items-center ml-2"
                style={{ backgroundColor: palette.accent }}
              >
                <Text className="text-white font-satoshiBold">Accept</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!incoming.length ? (
          <View className="rounded-3xl mt-3 p-4 items-center" style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}>
            <Text className="font-satoshiMedium" style={{ color: palette.textSecondary }}>
              No incoming orders right now.
            </Text>
          </View>
        ) : null}

        <Text className="mt-8 text-[20px] leading-[26px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Most Ordered Food
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {topMeals.map((meal, idx) => (
            <Pressable
              key={meal.id}
              onPress={() => router.push(`/kitchen/(tabs)/menu/${meal.id}` as any)}
              className="mr-3 rounded-3xl overflow-hidden"
              style={{ width: 235, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <View className="h-36 items-center justify-center bg-neutral-200">
                <CachedImageView
                  uri={meal.cover_image?.url}
                  className="w-full h-full"
                  fallback={
                    <Ionicons name="fast-food" size={36} color={palette.accentStrong} />
                  }
                />
              </View>

              <View className="p-4">
                <Text className="text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }} numberOfLines={1}>
                  {meal.name}
                </Text>
                <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
                  {formatNGN(Number(meal.price))}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
