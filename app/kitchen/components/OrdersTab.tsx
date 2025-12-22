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
import type {
  Order,
  OrderItem,
  OrderStatus,
} from "@/redux/orders/orders.types";

type Props = {
  orders: Order[];
  kitchenId: string | undefined;
  isDark: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAdvance: (orderId: string, itemId: string, nextStatus: OrderStatus) => void;
  updatingMap: Record<string, boolean>;
  loading: boolean;
};

const ACK_STATUS = "AWAITING_ACKNOWLEDGEMENT" as const;

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
  const filtered = orders.filter(
    (o) => o.kitchen_id === kitchenId && o.status === ACK_STATUS
  );

  const renderItem = (it: OrderItem) => (
    <View key={`${it.meal_id}-${it.id}`} className="flex-row items-center mb-2">
      {it.meal?.cover_image?.url ? (
        <Image
          source={{
            uri: it.meal?.cover_image?.url ?? it.meal?.cover_image ?? null,
          }}
          className={`w-12 h-12 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
        />
      ) : (
        <Image
          source={require("@/assets/images/logo-transparent.png")}
          className={`w-12 h-12 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
        />
      )}

      <View className="ml-3 flex-1">
        <Text
          className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
        >
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F59E0B"
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {loading && (
        <View className="py-10 items-center">
          <ActivityIndicator color="#F59E0B" />
        </View>
      )}
      {filtered.map((order) => {
        const item = order.items?.[0];
        const itemId = item?.id ?? item?.meal_id;
        const updating = itemId ? updatingMap[itemId] : false;

        return (
          <View
            key={order.id}
            className={`rounded-2xl border p-4 mb-3 ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-100"
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
                <Text
                  className={isDark ? "text-neutral-300" : "text-neutral-600"}
                >
                  {order.status.replace(/_/g, " ")}
                </Text>
              </View>
            </View>

            {order.items?.map(renderItem)}

            <View className="flex-row items-center justify-between mt-2">
              <Text
                className={isDark ? "text-neutral-300" : "text-neutral-700"}
              >
                Total {formatNGN(order.total)}
              </Text>
            </View>

            <View className="flex-row gap-2 mt-3">
              {(
                [
                  { label: "Prepare Order", status: "PREPARING" as OrderStatus },
                  {
                    label: "Send In Transit",
                    status: "IN_TRANSIT" as OrderStatus,
                  },
                ] as const
              ).map(({ label, status }) => (
                <Pressable
                  key={status}
                  onPress={() => itemId && onAdvance(order.id, itemId, status)}
                  disabled={updating || !itemId}
                className={`flex-1 rounded-xl py-2 items-center ${
                  updating || !itemId ? "opacity-60" : ""
                } ${updating ? "bg-neutral-600" : "bg-primary"}`}
              >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-satoshiMedium">
                      {label}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() =>
                itemId &&
                onAdvance(order.id, itemId, "CANCELLED")
              }
              disabled={updating || !itemId}
              className={`mt-3 rounded-xl py-2 items-center border border-red-500 bg-transparent ${
                updating || !itemId ? "opacity-60" : ""
              }`}
            >
              {updating ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text className="text-red-500 font-satoshiMedium">
                  Cancel Order
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}

      {!filtered.length && !loading && (
        <View className="items-center justify-center mt-10">
          <Image
            source={require("@/assets/images/empty-box.png")}
            className="w-24 h-24"
          />
          <Text
            className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
          >
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
