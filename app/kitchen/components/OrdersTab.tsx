import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { formatNGN } from "@/utils/money";
import type { Order, OrderItem } from "@/redux/orders/orders.types";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

type Props = {
  orders: Order[];
  kitchenId: string | undefined;
  isDark: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAdvanceItem: (
    orderId: string,
    itemId: string,
    nextStatus: "PREPARING" | "IN_TRANSIT" | "DELIVERED"
  ) => void;
  onCancelOrder: (orderId: string) => void;
  updatingMap: Record<string, boolean>;
  updatingOrderMap: Record<string, boolean>;
  loading: boolean;
};

type TabKey = "INCOMING" | "ONGOING" | "COMPLETED";

const ORDER_GROUPS: Record<TabKey, Order["status"][]> = {
  INCOMING: ["AWAITING_ACKNOWLEDGEMENT"],
  ONGOING: ["PREPARING", "IN_TRANSIT"],
  COMPLETED: ["DELIVERED", "CANCELLED"],
};

function toRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

function getPrimaryAction(status: Order["status"]) {
  if (status === "AWAITING_ACKNOWLEDGEMENT") {
    return { label: "Accept", nextStatus: "PREPARING" as const };
  }
  if (status === "PREPARING") {
    return { label: "Send Out", nextStatus: "IN_TRANSIT" as const };
  }
  if (status === "IN_TRANSIT") {
    return { label: "Delivered", nextStatus: "DELIVERED" as const };
  }

  return null;
}

function getStatusBadge(status: Order["status"]) {
  if (status === "AWAITING_ACKNOWLEDGEMENT") {
    return { label: "INCOMING", color: "#D97706", bg: "#FFF0D2" };
  }
  if (status === "PREPARING") {
    return { label: "PREPARING", color: "#B45309", bg: "#FEF3C7" };
  }
  if (status === "IN_TRANSIT") {
    return { label: "IN TRANSIT", color: "#1D4ED8", bg: "#DBEAFE" };
  }
  if (status === "CANCELLED") {
    return { label: "CANCELLED", color: "#B91C1C", bg: "#FEE2E2" };
  }

  return { label: "DELIVERED", color: "#166534", bg: "#DCFCE7" };
}

function getStatusIcon(status: Order["status"]) {
  if (status === "AWAITING_ACKNOWLEDGEMENT") return "bag-handle" as const;
  if (status === "PREPARING") return "timer" as const;
  if (status === "IN_TRANSIT") return "bicycle" as const;
  if (status === "CANCELLED") return "alert" as const;
  return "checkmark-circle" as const;
}

function itemTitle(item?: OrderItem) {
  if (!item?.meal?.name) return "Meal details unavailable";
  return `${item.quantity}x ${item.meal.name}`;
}

export default function OrdersTab({
  orders,
  kitchenId,
  isDark,
  refreshing,
  onRefresh,
  onAdvanceItem,
  onCancelOrder,
  updatingMap,
  updatingOrderMap,
  loading,
}: Props) {
  const palette = getKitchenPalette(isDark);
  const [activeTab, setActiveTab] = useState<TabKey>("INCOMING");

  const kitchenOrders = useMemo(() => {
    if (!kitchenId) return orders;
    return orders.filter((order) => order.kitchen_id === kitchenId);
  }, [orders, kitchenId]);

  const tabCounts = useMemo(() => {
    return {
      INCOMING: kitchenOrders.filter((o) => ORDER_GROUPS.INCOMING.includes(o.status)).length,
      ONGOING: kitchenOrders.filter((o) => ORDER_GROUPS.ONGOING.includes(o.status)).length,
      COMPLETED: kitchenOrders.filter((o) => ORDER_GROUPS.COMPLETED.includes(o.status)).length,
    };
  }, [kitchenOrders]);

  const visibleOrders = useMemo(() => {
    return kitchenOrders.filter((o) => ORDER_GROUPS[activeTab].includes(o.status));
  }, [kitchenOrders, activeTab]);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.accent} />
      }
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="text-[22px] leading-[30px] font-satoshiBold"
          style={{ color: palette.textPrimary }}
        >
          Orders
        </Text>

        <View className="flex-row items-center">
          <Pressable
            className="w-12 h-12 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="search" size={22} color={palette.textSecondary} />
          </Pressable>
          <Pressable
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="notifications" size={20} color={palette.textSecondary} />
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: palette.accent }} />
          </Pressable>
        </View>
      </View>

      <View className="mt-7 flex-row items-center">
        {([
          { key: "INCOMING", label: "Incoming" },
          { key: "ONGOING", label: "Ongoing" },
          { key: "COMPLETED", label: "Completed" },
        ] as const).map((tab) => {
          const active = activeTab === tab.key;
          const count = tabCounts[tab.key];

          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} className="mr-6">
              <View className="flex-row items-center pb-3">
                <Text
                  className="font-satoshiBold text-[15px]"
                  style={{ color: active ? palette.accentStrong : palette.textMuted }}
                >
                  {tab.label}
                </Text>
                <View
                  className="ml-2 rounded-full px-2 py-[2px]"
                  style={{ backgroundColor: active ? palette.accentSoft : palette.surfaceAlt }}
                >
                  <Text
                    className="text-[11px] font-satoshiBold"
                    style={{ color: active ? palette.accentStrong : palette.textSecondary }}
                  >
                    {count}
                  </Text>
                </View>
              </View>

              {active ? (
                <View
                  className="h-[2px] rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {loading && !visibleOrders.length ? (
        <View className="py-12 items-center">
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : null}

      {visibleOrders.map((order) => {
        const primaryItem = order.items?.[0];
        const primaryItemId = primaryItem?.id ?? "";
        const updatingItem = primaryItemId ? updatingMap[primaryItemId] : false;
        const updatingOrder = updatingOrderMap[order.id] === true;
        const badge = getStatusBadge(order.status);
        const primaryAction = getPrimaryAction(order.status);
        const canCancel = ["AWAITING_ACKNOWLEDGEMENT", "PREPARING"].includes(order.status);

        return (
          <View
            key={order.id}
            className="rounded-[26px] p-4 mt-4"
            style={{
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor:
                order.status === "CANCELLED"
                  ? isDark
                    ? "#4B2430"
                    : "#FFD6DD"
                  : palette.border,
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row flex-1 pr-3">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: isDark ? palette.elevated : palette.elevated }}
                >
                  <Ionicons
                    name={getStatusIcon(order.status)}
                    size={22}
                    color={
                      order.status === "CANCELLED"
                        ? palette.danger
                        : order.status === "DELIVERED"
                        ? palette.success
                        : palette.accentStrong
                    }
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="text-[14px]" style={{ color: palette.textSecondary }}>
                    {order.items.length} items • {toRelativeTime(order.created_at)}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                  {formatNGN(Number(order.total))}
                </Text>
                <View className="rounded-full px-3 py-1 mt-1" style={{ backgroundColor: badge.bg }}>
                  <Text className="text-[11px] font-satoshiBold" style={{ color: badge.color }}>
                    {badge.label}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="mt-3 text-[17px]" style={{ color: palette.textPrimary }}>
              {itemTitle(primaryItem)}
            </Text>

            {order.dispatch_rider_note ? (
              <View
                className="mt-3 rounded-2xl px-3 py-3"
                style={{ backgroundColor: isDark ? palette.surfaceAlt : "#FFF6E8" }}
              >
                <Text className="text-[13px] italic" style={{ color: palette.accentStrong }}>
                  “{order.dispatch_rider_note}”
                </Text>
              </View>
            ) : null}

            <View className="mt-4 flex-row">
              <Pressable
                onPress={() => router.push(`/kitchen/orders/${order.id}`)}
                className="flex-1 rounded-2xl py-3 items-center justify-center mr-2"
                style={{ backgroundColor: palette.accent }}
              >
                <Text className="text-white font-satoshiBold text-[17px]">View</Text>
              </Pressable>

              {primaryAction ? (
                <Pressable
                  onPress={() =>
                    primaryItemId
                      ? onAdvanceItem(order.id, primaryItemId, primaryAction.nextStatus)
                      : undefined
                  }
                  disabled={updatingItem || updatingOrder || !primaryItemId}
                  className="flex-1 rounded-2xl py-3 items-center justify-center ml-2"
                  style={{
                    backgroundColor: isDark ? palette.surfaceAlt : "#EFE9E0",
                    opacity: updatingItem || updatingOrder || !primaryItemId ? 0.6 : 1,
                  }}
                >
                  {updatingItem ? (
                    <ActivityIndicator color={palette.textSecondary} />
                  ) : (
                    <Text className="font-satoshiBold text-[17px]" style={{ color: palette.textPrimary }}>
                      {primaryAction.label}
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>

            {canCancel ? (
              <Pressable
                onPress={() => onCancelOrder(order.id)}
                disabled={updatingOrder}
                className="mt-3 rounded-2xl py-3 items-center justify-center"
                style={{
                  backgroundColor: isDark ? palette.dangerSoft : "#FFF1F3",
                  opacity: updatingOrder ? 0.65 : 1,
                }}
              >
                {updatingOrder ? (
                  <ActivityIndicator color={palette.danger} />
                ) : (
                  <Text className="font-satoshiBold text-[16px]" style={{ color: palette.danger }}>
                    Decline
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        );
      })}

      {!visibleOrders.length && !loading ? (
        <View className="items-center justify-center mt-16">
          <Image source={require("@/assets/images/empty-box.png")} className="w-24 h-24" />
          <Text className="mt-3 text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            No {activeTab.toLowerCase()} orders
          </Text>
          <Text className="mt-1 text-[13px]" style={{ color: palette.textSecondary }}>
            Pull to refresh and check for updates.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
