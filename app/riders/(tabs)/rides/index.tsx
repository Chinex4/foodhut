import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { fetchDeliveries, fetchRiderProfile } from "@/redux/logistics/logistics.thunks";
import {
  selectDeliveries,
  selectLogisticsStatus,
  selectRiderProfile,
} from "@/redux/logistics/logistics.selectors";
import type { Delivery, DeliveryStatus } from "@/redux/logistics/logistics.types";
import { formatNGN } from "@/utils/money";

type RideFilter = "completed" | "cancelled" | "active" | "all";

const getPickup = (delivery: Delivery) =>
  String(
    delivery.pickup_address ??
      delivery.order?.kitchen?.address ??
      delivery.order?.kitchen?.location ??
      "Pickup pending"
  );

const getDropoff = (delivery: Delivery) =>
  String(
    delivery.dropoff_address ??
      delivery.delivery_address ??
      delivery.order?.delivery_address ??
      "Dropoff pending"
  );

const isActive = (status: DeliveryStatus) =>
  ["ASSIGNED", "AWAITING_PICKUP", "PICKED_UP", "IN_TRANSIT"].includes(status);

const formatDate = (value: number | string) => {
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1000000000000 ? numeric * 1000 : numeric)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

export default function RiderRidesScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const riderProfile = useAppSelector(selectRiderProfile);
  const deliveries = useAppSelector(selectDeliveries);
  const logisticsStatus = useAppSelector(selectLogisticsStatus);
  const [filter, setFilter] = useState<RideFilter>("all");

  useEffect(() => {
    dispatch(fetchRiderProfile());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDeliveries({ page: 1, per_page: 50, rider_id: riderProfile?.id }));
  }, [dispatch, riderProfile?.id]);

  const filtered = useMemo(
    () =>
      deliveries
        .filter((delivery) => !riderProfile?.id || delivery.rider_id === riderProfile.id)
        .filter((delivery) => {
          if (filter === "all") return true;
          if (filter === "completed") return delivery.delivery_status === "DELIVERED";
          if (filter === "cancelled") {
            return delivery.delivery_status === "CANCELLED" || delivery.delivery_status === "FAILED";
          }
          return isActive(delivery.delivery_status);
        }),
    [deliveries, filter, riderProfile?.id]
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-2">
        <Text className={`text-2xl font-satoshiBold mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Ride History
        </Text>

        <View className={`flex-row rounded-full p-1 ${isDark ? "bg-neutral-800" : "bg-white"}`}>
          {[
            { key: "all" as const, label: "All" },
            { key: "active" as const, label: "Active" },
            { key: "completed" as const, label: "Done" },
            { key: "cancelled" as const, label: "Failed" },
          ].map((opt) => {
            const active = filter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setFilter(opt.key)}
                className={`flex-1 px-2 py-1.5 rounded-full items-center ${active ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-[12px] font-satoshiMedium ${
                    active
                      ? "text-white"
                      : isDark
                        ? "text-neutral-300"
                        : "text-neutral-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {logisticsStatus === "loading" && !filtered.length ? (
          <View className="items-center mt-10">
            <ActivityIndicator color="#F59E0B" />
          </View>
        ) : null}

        {filtered.map((delivery) => (
          <View
            key={delivery.id}
            className={`rounded-3xl px-4 py-4 mb-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                Delivery #{delivery.id.slice(0, 8)}
              </Text>
              <Text className={`text-[11px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {formatDate(delivery.created_at)}
              </Text>
            </View>

            <View className="flex-row mt-2">
              <View className="items-center mr-3">
                <View className="w-2 h-2 rounded-full bg-primary mb-1" />
                <View className={`w-0.5 flex-1 ${isDark ? "bg-neutral-700" : "bg-neutral-200"}`} />
                <View className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
              </View>
              <View className="flex-1">
                <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Pickup
                </Text>
                <Text className={`text-[13px] font-satoshiMedium mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                  {getPickup(delivery)}
                </Text>
                <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Dropoff
                </Text>
                <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                  {getDropoff(delivery)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={isDark ? "#E5E7EB" : "#111827"}
                  style={{ marginRight: 4 }}
                />
                <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                  {formatNGN(delivery.delivery_fee ?? delivery.earning?.amount ?? 0)}
                </Text>
              </View>

              <StatusPill status={delivery.delivery_status} />
            </View>
          </View>
        ))}

        {filtered.length === 0 && logisticsStatus !== "loading" && (
          <View className="mt-10 items-center">
            <Ionicons name="bicycle-outline" size={42} color={isDark ? "#6B7280" : "#D1D5DB"} />
            <Text className={`mt-3 text-[13px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              No rides in this category yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusPill({ status }: { status: DeliveryStatus }) {
  const isBad = status === "CANCELLED" || status === "FAILED";
  const isDone = status === "DELIVERED";
  const bg = isBad ? "bg-rose-100" : isDone ? "bg-emerald-100" : "bg-amber-100";
  const text = isBad ? "text-rose-700" : isDone ? "text-emerald-700" : "text-amber-700";

  return (
    <View className={`px-3 py-1 rounded-full ${bg}`}>
      <Text className={`text-[11px] font-satoshiMedium ${text}`}>{status}</Text>
    </View>
  );
}
