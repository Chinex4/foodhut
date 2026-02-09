import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import OrdersTab from "@/app/kitchen/components/OrdersTab";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { useAppDispatch } from "@/store/hooks";
import { updateOrderItemStatus } from "@/redux/orders/orders.thunks";
import { showError, showSuccess } from "@/components/ui/toast";

export default function KitchenOrdersScreen() {
  const dispatch = useAppDispatch();
  const {
    isDark,
    kitchen,
    kitchenStatus,
    orders,
    ordersStatus,
    refreshOrders,
    updatingMap,
  } = useKitchenData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleAdvance = async (
    orderId: string,
    itemId: string,
    nextStatus: string
  ) => {
    try {
      await dispatch(
        updateOrderItemStatus({
          orderId,
          itemId,
          status: nextStatus as any,
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order updated");
    } catch (err: any) {
      showError(err?.message || "Failed to update order");
    }
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color="#F59E0B" />
      </View>
    );
  }

  return (
    <View className={`flex-1 pt-16 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OrdersTab
        orders={orders}
        kitchenId={kitchen?.id}
        isDark={isDark}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onAdvance={handleAdvance}
        updatingMap={updatingMap}
        loading={ordersStatus === "loading"}
      />
    </View>
  );
}
