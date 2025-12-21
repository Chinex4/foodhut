// components/orders/OngoingTab.tsx
import { showError } from "@/components/ui/toast";
import {
  selectOngoingOrders,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import OrderCard from "./OrderCard";

export default function OngoingTab() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectOrdersListStatus);
  const orders = useAppSelector(selectOngoingOrders);
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchOrders({ page: 1, per_page: 50 })).unwrap();
    } catch (err: any) {
      showError(err?.message || "Failed to refresh orders");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch orders on mount and when tab becomes visible
  useEffect(() => {
    dispatch(fetchOrders({ page: 1, per_page: 50 }));
  }, [dispatch]);

  if (status === "loading")
    return (
      <ActivityIndicator
        className="text-center mt-44"
        color={"#ffa800"}
        size={24}
      />
    );
  if (status === "failed")
    return (
      <Text
        className={`text-center mt-44 ${isDark ? "text-red-400" : "text-red-600"}`}
      >
        Failed to load orders.
      </Text>
    );
  if (!orders.length)
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text
          className={`mt-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
        >
          Your tray is empty, we are waiting for your orders
        </Text>
      </View>
    );

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      renderItem={({ item }) => <OrderCard order={item} isDark={isDark} />}
    />
  );
}
