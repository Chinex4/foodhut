// components/orders/OngoingTab.tsx
import { showError, showSuccess } from "@/components/ui/toast";
import {
  makeSelectPayStatus,
  makeSelectUpdateOrderStatus,
  selectOngoingOrders,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  fetchOrders,
  payForOrder,
  updateOrderStatus,
  updateOrderItemStatus,
} from "@/redux/orders/orders.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

function OrderCard({ order, isDark }: { order: any; isDark: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const payStatus = useAppSelector(makeSelectPayStatus(order.id)) ?? "idle";
  const cancelStatus =
    useAppSelector(makeSelectUpdateOrderStatus(order.id)) ?? "idle";
  const [completingPayment, setCompletingPayment] = React.useState(false);

  const handleCompletePayment = async () => {
    try {
      setCompletingPayment(true);
      const payRes = await dispatch(
        payForOrder({ id: order.id, with: "ONLINE" })
      ).unwrap();
      // @ts-ignore
      const url: string = payRes.url;
      if (url) {
        await WebBrowser.openBrowserAsync(url);
        showSuccess("Complete payment in your browser");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to initiate payment");
    } finally {
      setCompletingPayment(false);
    }
  };

  const handleMarkReceived = async (orderId: string) => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId,
          status: "DELIVERED",
          as_kitchen: false,
        })
      ).unwrap();
      showSuccess("Order Delivered!");
    } catch (err: any) {
      console.log(err);
      showError(err || "Failed to cancel order");
    }
  };

  const handleCancelOrder = async () => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId: order.id,
          status: "CANCELLED",
          as_kitchen: false,
        })
      ).unwrap();
      showSuccess("Order cancelled");
    } catch (err: any) {
      console.log(err);
      showError(err || "Failed to cancel order");
    }
  };

  const isPending = order.status === "AWAITING_PAYMENT";
  const showPaymentButton = isPending; // Show complete payment for pending orders

  return (
    <View
      className={`rounded-2xl mx-4 mt-4 p-3 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text
            className={`uppercase font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            {order.kitchen.name}
          </Text>
          <Text
            className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            {order.items.length} {order.items.length > 1 ? "Items" : "Item"} ·{" "}
            {formatNGN(order.total)}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-primary-50"}`}
        >
          <Text className="text-[12px] font-satoshiMedium text-primary">
            {order.status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        <Pressable
          onPress={() => router.push(`/users/orders/${order.id}`)}
          className={`flex-1 rounded-xl py-2 items-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="eye-outline"
              size={16}
              color={isDark ? "#E5E7EB" : "#6B7280"}
            />
            <Text
              className={`font-satoshiMedium ml-2 ${isDark ? "text-neutral-200" : "text-neutral-700"}`}
            >
              View
            </Text>
          </View>
        </Pressable>
        {showPaymentButton && (
          <>
            <Pressable
              onPress={handleCompletePayment}
              disabled={completingPayment || payStatus === "loading"}
              className="flex-1 bg-primary rounded-xl py-2 items-center"
            >
              {completingPayment || payStatus === "loading" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={16} color="#000" />
                  <Text className="text-neutral-800 font-satoshiMedium ml-2">
                    Complete Payment
                  </Text>
                </View>
              )}
            </Pressable>
          </>
        )}

        {!showPaymentButton && (
          <Pressable
            onPress={() => handleMarkReceived(order.id)}
            className="flex-1 bg-primary rounded-xl py-2 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text className="text-white font-satoshiMedium ml-2">
                Mark As Received
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

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
