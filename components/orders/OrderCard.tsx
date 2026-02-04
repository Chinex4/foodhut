import { showError, showSuccess } from "@/components/ui/toast";
import {
  makeSelectPayStatus,
  makeSelectUpdateOrderStatus,
} from "@/redux/orders/orders.selectors";
import type { Order } from "@/redux/orders/orders.types";
import { payForOrder, updateOrderStatus } from "@/redux/orders/orders.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { setCartItem } from "@/redux/cart/cart.thunks";

type Props = {
  order: Order;
  isDark: boolean;
};

export default function OrderCard({ order, isDark }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const payStatus = useAppSelector(makeSelectPayStatus(order.id)) ?? "idle";
  const updateStatus =
    useAppSelector(makeSelectUpdateOrderStatus(order.id)) ?? "idle";
  const [completingPayment, setCompletingPayment] = React.useState(false);

  const isPendingPayment = order.status === "AWAITING_PAYMENT";
  const canMarkReceived =
    order.status === "PREPARING" || order.status === "IN_TRANSIT";
  const canRepeat = order.status === "DELIVERED";

  const handleCompletePayment = async () => {
    try {
      setCompletingPayment(true);
      const payRes = await dispatch(
        payForOrder({ id: order.id, with: "ONLINE" })
      ).unwrap();
      if (payRes.with === "ONLINE" && payRes.url) {
        await WebBrowser.openBrowserAsync(payRes.url);
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
      showError(err || "Failed to update order");
    }
  };

  const handleRepeat = async () => {
    try {
      for (const item of order.items) {
        await dispatch(
          setCartItem({ mealId: item.meal_id, quantity: item.quantity })
        ).unwrap();
      }
      showSuccess("Order items added to cart");
    } catch (err: any) {
      showError(err || "Failed to repeat order");
    }
  };

  return (
    <View
      className={`rounded-2xl mx-4 mt-4 p-3 border ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
      }`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text
            className={`uppercase font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            {order.kitchen.name}
          </Text>
          <Text
            className={`text-[12px] mt-1 ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            {order.items.length} {order.items.length > 1 ? "Items" : "Item"} ·{" "}
            {formatNGN(order.total)}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full ${
            isDark ? "bg-neutral-800" : "bg-primary-50"
          }`}
        >
          <Text className="text-[12px] font-satoshiMedium text-primary">
            {order.status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        <Pressable
          onPress={() => router.push(`/users/orders/${order.id}`)}
          className={`flex-1 rounded-xl py-2 items-center ${
            isDark ? "bg-neutral-800" : "bg-neutral-100"
          }`}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="eye-outline"
              size={16}
              color={isDark ? "#E5E7EB" : "#6B7280"}
            />
            <Text
              className={`font-satoshiMedium ml-2 ${
                isDark ? "text-neutral-200" : "text-neutral-700"
              }`}
            >
              View
            </Text>
          </View>
        </Pressable>
        {canRepeat && (
          <Pressable
            onPress={handleRepeat}
            className="flex-1 bg-primary rounded-xl py-2 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh-outline" size={16} color="#000" />
              <Text className="text-neutral-800 font-satoshiMedium ml-2">
                Repeat Order
              </Text>
            </View>
          </Pressable>
        )}
        {isPendingPayment && (
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
        )}
        {canMarkReceived && (
          <Pressable
            onPress={() => handleMarkReceived(order.id)}
            disabled={updateStatus === "loading"}
            className="flex-1 bg-primary rounded-xl py-2 items-center"
          >
            {updateStatus === "loading" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text className="text-white font-satoshiMedium ml-2">
                  Mark As Received
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
