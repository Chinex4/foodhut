// components/orders/CompletedTab.tsx
import {
    selectOrdersList,
    selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";

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
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="font-satoshiBold text-neutral-900">
                {item.kitchen.name}
              </Text>
              <Text className="text-neutral-500 text-[12px] mt-1">
                {item.items.length} Items · {formatNGN(item.total)}
              </Text>
            </View>
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-[12px] font-satoshiMedium text-green-700">
                Completed
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row gap-2">
            <Pressable
              onPress={() => router.push(`/users/orders/${item.id}` as any)}
              className="flex-1 bg-primary rounded-xl py-3 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text className="text-white font-satoshiBold ml-2">View</Text>
              </View>
            </Pressable>
            <Pressable className="w-14 bg-neutral-100 rounded-xl items-center justify-center">
              <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}
