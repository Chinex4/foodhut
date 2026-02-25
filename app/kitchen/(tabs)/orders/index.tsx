import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import OrdersTab from "@/app/kitchen/components/OrdersTab";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { useAppDispatch } from "@/store/hooks";
import {
  updateOrderItemStatus,
  updateOrderStatus,
} from "@/redux/orders/orders.thunks";
import { showError, showSuccess } from "@/components/ui/toast";
import type { OrderStatus } from "@/redux/orders/orders.types";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

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
    updatingOrderMap,
  } = useKitchenData({ ordersStatus: null });

  const palette = getKitchenPalette(isDark);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleAdvanceItem = async (
    orderId: string,
    itemId: string,
    nextStatus: "PREPARING" | "IN_TRANSIT" | "DELIVERED"
  ) => {
    try {
      await dispatch(
        updateOrderItemStatus({
          orderId,
          itemId,
          status: nextStatus,
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order updated");
    } catch (err: any) {
      showError(err?.message || "Failed to update order");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId,
          status: "CANCELLED" as OrderStatus,
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order declined");
    } catch (err: any) {
      showError(err?.message || "Failed to decline order");
    }
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OrdersTab
        orders={orders}
        kitchenId={kitchen?.id}
        isDark={isDark}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onAdvanceItem={handleAdvanceItem}
        onCancelOrder={handleCancelOrder}
        updatingMap={updatingMap}
        updatingOrderMap={updatingOrderMap}
        loading={ordersStatus === "loading"}
      />
    </SafeAreaView>
  );
}
