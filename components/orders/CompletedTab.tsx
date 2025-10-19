// components/orders/CompletedTab.tsx
import React, { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectOrdersList,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { formatNGN } from "@/utils/money";
import { router } from "expo-router";
import { Image } from "react-native";

export default function CompletedTab() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectOrdersListStatus);
  const orders = useAppSelector(selectOrdersList).filter(
    (o) => o.status === "DELIVERED"
  );

  useEffect(() => {
    if (status === "idle")
      dispatch(fetchOrders({ page: 1, per_page: 50, status: "DELIVERED" }));
  }, [status, dispatch]);

  if (status === "loading")
    return <Text className="text-center mt-10 text-neutral-500">Loading…</Text>;
  if (status === "failed")
    return (
      <Text className="text-center mt-10 text-red-600">Failed to load.</Text>
    );
  if (!orders.length)
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text className="text-neutral-500 mt-4">No completed orders yet</Text>
      </View>
    );

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

          <View className="mt-3 flex-row">
            <Pressable
              onPress={() => router.push(`/users/orders/${item.id}` as any)}
              className="flex-1 bg-primary rounded-xl py-3 items-center mr-3"
            >
              <Text className="text-white font-satoshiBold">View</Text>
            </Pressable>
            <Pressable className="w-28 bg-neutral-100 rounded-xl items-center justify-center">
              <Text>Clear</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}
