// components/orders/OngoingTab.tsx
import { showError, showSuccess } from "@/components/ui/toast";
import {
    makeSelectPayStatus,
    selectOngoingOrders,
    selectOrdersListStatus
} from "@/redux/orders/orders.selectors";
import {
    fetchOrders,
    payForOrder,
    updateOrderItemStatus,
} from "@/redux/orders/orders.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

function OrderCard({ order }: { order: any }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const payStatus = useAppSelector(makeSelectPayStatus(order.id)) ?? "idle";
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

  const handleMarkReceived = (orderId: string, items: any[]) => {
    items.forEach((it) =>
      dispatch(
        updateOrderItemStatus({
          orderId,
          itemId: it.id!,
          status: "DELIVERED",
        })
      )
    );
  };

  const isPending = order.status === "PENDING";
  const showPaymentButton = isPending; // Show complete payment for pending orders

  return (
    <View className="bg-white rounded-2xl mx-4 mt-4 p-3 border border-neutral-100">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="font-satoshiBold text-neutral-900">
            {order.kitchen.name}
          </Text>
          <Text className="text-neutral-500 text-[12px] mt-1">
            {order.items.length} Items · {formatNGN(order.total)}
          </Text>
        </View>
        <View className="bg-primary-50 px-2 py-1 rounded-full">
          <Text className="text-[12px] font-satoshiMedium text-primary">
            {order.status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        <Pressable
          onPress={() => router.push(`/users/orders/${order.id}`)}
          className="flex-1 bg-neutral-100 rounded-xl py-2 items-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="eye-outline" size={16} color="#6B7280" />
            <Text className="text-neutral-700 font-satoshiMedium ml-2">
              View
            </Text>
          </View>
        </Pressable>

        {showPaymentButton && (
          <Pressable
            onPress={handleCompletePayment}
            disabled={completingPayment || payStatus === "loading"}
            className="flex-1 bg-primary rounded-xl py-2 items-center"
          >
            {completingPayment || payStatus === "loading" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={16} color="#fff" />
                <Text className="text-white font-satoshiMedium ml-2">
                  Complete Payment
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {!showPaymentButton && (
          <Pressable
            onPress={() => handleMarkReceived(order.id, order.items)}
            className="flex-1 bg-primary rounded-xl py-2 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text className="text-white font-satoshiMedium ml-2">
                Received
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

  // Fetch orders on mount and when tab becomes visible
  useEffect(() => {
    dispatch(fetchOrders({ page: 1, per_page: 50 }));
    
    // Refetch every 5 seconds to keep orders in sync
    const interval = setInterval(() => {
      dispatch(fetchOrders({ page: 1, per_page: 50 }));
    }, 5000);

    return () => clearInterval(interval);
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
      <Text className="text-center mt-44 text-red-600">
        Failed to load orders.
      </Text>
    );
  if (!orders.length)
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text className="text-neutral-500 mt-4">
          Your tray is empty, we are waiting for your orders
        </Text>
      </View>
    );

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ paddingBottom: 120 }}
      renderItem={({ item }) => <OrderCard order={item} />}
    />
  );
}
