import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import {
  makeSelectOrderByIdStatus,
  makeSelectUpdateOrderStatus,
  selectOrderById,
} from "@/redux/orders/orders.selectors";
import { fetchOrderById, updateOrderStatus } from "@/redux/orders/orders.thunks";
import { formatNGN } from "@/utils/money";
import { showError, showSuccess } from "@/components/ui/toast";
import type { OrderStatus } from "@/redux/orders/orders.types";

const NEXT_ACTION: Record<
  string,
  { label: string; status: OrderStatus } | undefined
> = {
  AWAITING_ACKNOWLEDGEMENT: { label: "Accept Order", status: "PREPARING" },
  PREPARING: { label: "Mark In Transit", status: "IN_TRANSIT" },
  IN_TRANSIT: { label: "Mark Delivered", status: "DELIVERED" },
};

export default function KitchenOrderDetailsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);
  const dispatch = useAppDispatch();

  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = String(id || "");
  const order = useAppSelector(selectOrderById(orderId));
  const byIdStatus = useAppSelector(
    useMemo(() => makeSelectOrderByIdStatus(orderId), [orderId])
  );
  const updateStatus = useAppSelector(
    useMemo(() => makeSelectUpdateOrderStatus(orderId), [orderId])
  );

  useEffect(() => {
    if (orderId && !order) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, order, orderId]);

  const nextAction = order ? NEXT_ACTION[order.status] : undefined;
  const canDecline = order
    ? order.status === "AWAITING_ACKNOWLEDGEMENT" || order.status === "PREPARING"
    : false;

  const onAdvance = async () => {
    if (!order || !nextAction) return;
    try {
      await dispatch(
        updateOrderStatus({
          orderId: order.id,
          status: nextAction.status,
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order updated");
    } catch (error: any) {
      showError(error?.message || "Failed to update order");
    }
  };

  const onDecline = async () => {
    if (!order) return;
    try {
      await dispatch(
        updateOrderStatus({
          orderId: order.id,
          status: "CANCELLED",
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess("Order declined");
    } catch (error: any) {
      showError(error?.message || "Failed to decline order");
    }
  };

  if (!order && byIdStatus === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle" size={28} color={palette.danger} />
        <Text className="mt-2 font-satoshiBold text-[18px]" style={{ color: palette.textPrimary }}>
          Order not found
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-2xl px-5 py-3" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white font-satoshiBold">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-20 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Order Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.accentSoft }}>
              <Text className="text-[11px] font-satoshiBold" style={{ color: palette.accentStrong }}>
                {order.status}
              </Text>
            </View>
          </View>

          <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
            Customer: {order.owner.first_name} {order.owner.last_name}
          </Text>
          <Text className="text-[14px]" style={{ color: palette.textSecondary }}>
            Placed: {new Date(order.created_at).toLocaleString()}
          </Text>
          {order.delivery_address ? (
            <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
              Delivery: {order.delivery_address}
            </Text>
          ) : null}

          <View className="mt-4" style={{ borderTopWidth: 1, borderTopColor: palette.border }}>
            {order.items.map((item) => (
              <View key={item.id || item.meal_id} className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
                <View className="flex-1 pr-2">
                  <Text className="text-[15px]" style={{ color: palette.textPrimary }}>
                    {item.meal?.name || "Meal"}
                  </Text>
                  <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
                    {formatNGN(item.price)} x {item.quantity}
                  </Text>
                </View>
                <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                  {formatNGN(Number(item.price) * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              Total
            </Text>
            <Text className="text-[20px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              {formatNGN(order.total)}
            </Text>
          </View>

          {order.dispatch_rider_note ? (
            <View className="mt-4 rounded-2xl p-3" style={{ backgroundColor: isDark ? palette.surfaceAlt : "#FFF6E8" }}>
              <Text className="text-[12px] mb-1" style={{ color: palette.textMuted }}>
                Rider note
              </Text>
              <Text className="text-[13px]" style={{ color: palette.accentStrong }}>
                {order.dispatch_rider_note}
              </Text>
            </View>
          ) : null}
        </View>

        {nextAction ? (
          <Pressable
            onPress={onAdvance}
            disabled={updateStatus === "loading"}
            className="mt-5 rounded-2xl py-4 items-center"
            style={{ backgroundColor: palette.accent, opacity: updateStatus === "loading" ? 0.7 : 1 }}
          >
            {updateStatus === "loading" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold text-[16px]">
                {nextAction.label}
              </Text>
            )}
          </Pressable>
        ) : null}

        {canDecline ? (
          <Pressable
            onPress={onDecline}
            disabled={updateStatus === "loading"}
            className="mt-3 rounded-2xl py-4 items-center"
            style={{ backgroundColor: isDark ? palette.dangerSoft : "#FFF1F2", opacity: updateStatus === "loading" ? 0.7 : 1 }}
          >
            <Text className="font-satoshiBold text-[16px]" style={{ color: palette.danger }}>
              Decline Order
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
