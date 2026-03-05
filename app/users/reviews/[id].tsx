import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import {
  selectOrdersError,
  selectOrdersList,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

type ReviewRow = {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
};

export default function ReviewsScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const targetType = type ?? "meal";

  const orders = useAppSelector(selectOrdersList);
  const ordersStatus = useAppSelector(selectOrdersListStatus);
  const ordersError = useAppSelector(selectOrdersError);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (ordersStatus === "idle") {
      dispatch(fetchOrders({ page: 1, per_page: 100 }));
    }
  }, [dispatch, isAuthenticated, ordersStatus]);

  const items = useMemo<ReviewRow[]>(() => {
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");

    if (targetType === "kitchen") {
      return deliveredOrders
        .filter((order) => order.kitchen_id === id)
        .map((order) => ({
          id: order.id,
          user_name: `${order.owner.first_name} ${order.owner.last_name}`.trim() || "Customer",
          rating: Number(order.kitchen.rating) || 0,
          comment: order.dispatch_rider_note || "Order delivered successfully.",
        }));
    }

    return deliveredOrders
      .filter((order) => order.items.some((item) => item.meal_id === id))
      .map((order) => {
        const matchedItem = order.items.find((item) => item.meal_id === id);
        return {
          id: `${order.id}:${matchedItem?.meal_id || "meal"}`,
          user_name: `${order.owner.first_name} ${order.owner.last_name}`.trim() || "Customer",
          rating: Number(matchedItem?.meal.rating || 0),
          comment: order.dispatch_rider_note || "Delivered successfully.",
        };
      });
  }, [id, orders, targetType]);

  const avg = useMemo(() => {
    if (!items.length) return "0.0";
    const sum = items.reduce((total, item) => total + item.rating, 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="pt-16 pb-4 px-5">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#0F172A"} />
          </Pressable>
          <Text
            className={`text-2xl font-satoshiBold ml-2 ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Reviews
          </Text>
        </View>

        <View
          className={`mt-4 rounded-2xl border p-3 flex-row items-center justify-between ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View>
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Average rating
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FFA800" />
              <Text className={`ml-2 text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {avg}
              </Text>
            </View>
          </View>
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {items.length} review{items.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <FlatList<ReviewRow>
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        ListHeaderComponent={
          <View
            className={`rounded-2xl border p-4 mb-4 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`font-satoshiBold text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}>
              Customer feedback
            </Text>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Ratings are derived from completed orders.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-10 items-center">
            {!isAuthenticated ? (
              <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                Sign in to view reviews.
              </Text>
            ) : ordersStatus === "loading" ? (
              <ActivityIndicator color="#FFA800" />
            ) : ordersError ? (
              <Text className="text-red-500">{ordersError}</Text>
            ) : (
              <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                No reviews yet.
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View
            className={`rounded-2xl border p-4 mb-3 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {item.user_name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FFA800" />
                <Text className={`ml-1 text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text className={`mt-2 text-[13px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {item.comment}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
