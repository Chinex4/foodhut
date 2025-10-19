// components/orders/OngoingTab.tsx
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectOrdersList,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import {
  fetchOrders,
  updateOrderItemStatus,
} from "@/redux/orders/orders.thunks";
import { formatNGN } from "@/utils/money";

const ONGOING_STATUSES = [
  "PENDING",
  "AWAITING_ACKNOWLEDGEMENT",
  "PREPARING",
  "IN_TRANSIT",
] as const;

export default function OngoingTab() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectOrdersListStatus);
  const orders = useAppSelector(selectOrdersList).filter((o) =>
    ONGOING_STATUSES.includes(o.status as any)
  );

  useEffect(() => {
    if (status === "idle") dispatch(fetchOrders({ page: 1, per_page: 50 }));
  }, [status, dispatch]);

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

  const markOrderReceived = (orderId: string, items: any[]) => {
    // Mark all items delivered
    items.forEach((it) =>
      dispatch(
        updateOrderItemStatus({ orderId, itemId: it.id!, status: "DELIVERED" })
      )
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ paddingBottom: 120 }}
      renderItem={({ item }) => (
        <View className="bg-white rounded-2xl mx-4 mt-4 p-3 border border-neutral-100">
          <Text className="font-satoshiBold">{item.kitchen.name}</Text>
          <Text className="text-neutral-500 text-[12px] mt-1">
            {item.items.length} Items · {formatNGN(item.total)}
          </Text>

          <Pressable
            onPress={() => markOrderReceived(item.id, item.items)}
            className="mt-3 bg-primary rounded-xl py-3 items-center"
          >
            <Text className="text-white font-satoshiBold">
              Mark as Received
            </Text>
          </Pressable>
        </View>
      )}
    />
  );
}
