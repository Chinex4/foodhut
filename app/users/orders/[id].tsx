import React, { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById } from "@/redux/orders/orders.thunks";
import {
  selectOrderById,
  makeSelectOrderByIdStatus,
} from "@/redux/orders/orders.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import CachedImageView from "@/components/ui/CachedImage";
import { setCartItem } from "@/redux/cart/cart.thunks";
import { useEnsureAuthenticated } from "@/hooks/useEnsureAuthenticated";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrderById(id!));
  const status = useAppSelector(makeSelectOrderByIdStatus(id!));
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { isAuthenticated, redirectToLogin } = useEnsureAuthenticated();
  const canRepeat = order?.status === "DELIVERED";

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin]);

  useEffect(() => {
    if (!order) dispatch(fetchOrderById(id!));
  }, [id, order, dispatch]);

  if (!order || status === "loading")
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text className={`text-center mt-10 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Loading…
        </Text>
      </View>
    );

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2 mt-20">
        <Pressable onPress={() => router.push("/users/(tabs)/orders")} className="mr-2 p-1">
          <Ionicons name="chevron-back" size={26} color={isDark ? "#E5E7EB" : "#111"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Order #{order.id.slice(-6)}
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(it) => it.id ?? it.meal_id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            className={`rounded-2xl border p-3 mb-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
          >
            <View className="flex-row">
              <CachedImageView
                uri={item.meal.cover_image?.url ?? undefined}
                fallback={
                  <View
                    className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                  />
                }
                className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
              />
              <View className="ml-3 flex-1">
                <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {item.meal.name}
                </Text>
                <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {formatNGN(item.price)} × {item.quantity}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Subtotal</Text>
              <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(order.sub_total)}
              </Text>
            </View>
            {order.delivery_fee && (
              <View className="flex-row justify-between mb-2">
                <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Delivery</Text>
                <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {formatNGN(order.delivery_fee)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mt-2">
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                Total
              </Text>
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(order.total)}
              </Text>
            </View>
            {canRepeat && (
              <Pressable
                onPress={async () => {
                  for (const item of order.items) {
                    await dispatch(
                      setCartItem({ mealId: item.meal_id, quantity: item.quantity })
                    );
                  }
                  router.push("/users/(tabs)/orders");
                }}
                className="mt-5 bg-primary rounded-2xl py-4 items-center justify-center"
              >
                <Text className="text-white font-satoshiBold">
                  Repeat Order
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}
