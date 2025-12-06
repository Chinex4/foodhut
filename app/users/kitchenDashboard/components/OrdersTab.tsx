import React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import CachedImage from "@/components/ui/CachedImage";
import { formatNGN } from "@/utils/money";
import type { Order, OrderItem } from "@/redux/orders/orders.types";

type Props = {
  orders: Order[];
  kitchenId: string | undefined;
  isDark: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAdvance: (orderId: string, itemId: string, nextStatus: string, asKitchen: boolean) => void;
  updatingMap: Record<string, boolean>;
  loading: boolean;
};

const nextStatusFor = (status: string) => {
  switch (status) {
    case "AWAITING_ACKNOWLEDGEMENT":
      return "PREPARING";
    case "PREPARING":
      return "IN_TRANSIT";
    case "IN_TRANSIT":
      return "DELIVERED";
    default:
      return null;
  }
};

export default function OrdersTab({
  orders,
  kitchenId,
  isDark,
  refreshing,
  onRefresh,
  onAdvance,
  updatingMap,
  loading,
}: Props) {
  const filtered = orders.filter((o) => o.kitchen_id === kitchenId);

  const renderItem = (it: OrderItem) => (
    <View key={`${it.meal_id}-${it.id}`} className="flex-row items-center mb-2">
      <CachedImage
        uri={it.meal?.cover_image?.url ?? it.meal?.cover_image ?? null}
        fallback={
          <Image
            source={require("@/assets/images/logo-transparent.png")}
            className={`w-12 h-12 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
          />
        }
        className={`w-12 h-12 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
      />
      <View className="ml-3 flex-1">
        <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
          {it.meal?.name}
        </Text>
        <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
          Qty {it.quantity} • {formatNGN(it.price)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {loading && (
        <View className="py-10 items-center">
          <ActivityIndicator color="#F59E0B" />
        </View>
      )}
      {filtered.map((order) => {
        const next = nextStatusFor(order.status);
        const canUpdate = Boolean(next);
        const item = order.items?.[0];
        const itemId = item?.id ?? item?.meal_id;
        const updating = itemId ? updatingMap[itemId] : false;

        return (
          <View
            key={order.id}
            className={`rounded-2xl border p-4 mb-3 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className={`font-satoshiBold text-[15px] ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Order #{order.id.slice(0, 6)}
              </Text>
              <View
                className={`px-2 py-1 rounded-full ${
                  isDark ? "bg-neutral-800" : "bg-neutral-100"
                }`}
              >
                <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
                  {order.status.replace(/_/g, " ")}
                </Text>
              </View>
            </View>

            {order.items?.map(renderItem)}

            <View className="flex-row items-center justify-between mt-2">
              <Text className={isDark ? "text-neutral-300" : "text-neutral-700"}>
                Total {formatNGN(order.total)}
              </Text>
              {canUpdate ? (
                <Pressable
                  onPress={() =>
                    itemId &&
                    onAdvance(order.id, itemId, next!, next !== "DELIVERED")
                  }
                  disabled={updating || !itemId}
                  className={`px-3 py-2 rounded-xl ${
                    updating ? "bg-neutral-600" : "bg-primary"
                  }`}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-satoshiBold">
                      Mark {next?.replace(/_/g, " ")}
                    </Text>
                  )}
                </Pressable>
              ) : (
                <Text className={isDark ? "text-neutral-500" : "text-neutral-500"}>
                  No further actions
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {!filtered.length && !loading && (
        <View className="items-center mt-10">
          <Image
            source={require("@/assets/images/empty-box.png")}
            className="w-24 h-24"
          />
          <Text className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
            No orders yet
          </Text>
          <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
            Pull to refresh to check for new orders
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
