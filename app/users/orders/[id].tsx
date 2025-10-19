import React, { useEffect } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById } from "@/redux/orders/orders.thunks";
import {
  selectOrderById,
  makeSelectOrderByIdStatus,
} from "@/redux/orders/orders.selectors";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrderById(id!));
  const status = useAppSelector(makeSelectOrderByIdStatus(id!));

  useEffect(() => {
    if (!order) dispatch(fetchOrderById(id!));
  }, [id, order, dispatch]);

  if (!order || status === "loading")
    return <Text className="text-center mt-10 text-neutral-500">Loading…</Text>;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-2 p-1">
          <Ionicons name="chevron-back" size={26} color="#111" />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold">
          Order #{order.id.slice(-6)}
        </Text>
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(it) => it.id ?? it.meal_id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-neutral-100 p-3 mb-3">
            <View className="flex-row">
              <Image
                source={{ uri: item.meal.cover_image?.url ?? "" }}
                className="w-16 h-16 rounded-xl bg-neutral-100"
              />
              <View className="ml-3 flex-1">
                <Text className="font-satoshiMedium">{item.meal.name}</Text>
                <Text className="text-neutral-500 text-[12px]">
                  {formatNGN(item.price)} × {item.quantity}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">Subtotal</Text>
              <Text className="font-satoshiMedium">
                {formatNGN(order.sub_total)}
              </Text>
            </View>
            {order.delivery_fee && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-neutral-500">Delivery</Text>
                <Text className="font-satoshiMedium">
                  {formatNGN(order.delivery_fee)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mt-2">
              <Text className="font-satoshiBold">Total</Text>
              <Text className="font-satoshiBold">{formatNGN(order.total)}</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}
