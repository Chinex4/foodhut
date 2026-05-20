import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { fetchDeliveries } from "@/redux/logistics/logistics.thunks";
import { selectDeliveries, selectLogisticsStatus } from "@/redux/logistics/logistics.selectors";
import type { Delivery } from "@/redux/logistics/logistics.types";
import { formatNGN } from "@/utils/money";

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

export default function RiderSearchScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const deliveries = useAppSelector(selectDeliveries);
  const logisticsStatus = useAppSelector(selectLogisticsStatus);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchDeliveries({ page: 1, per_page: 50 }));
  }, [dispatch]);

  const results = useMemo(() => {
    const available = deliveries.filter((delivery) =>
      ["PENDING", "ASSIGNED", "AWAITING_PICKUP", "PICKED_UP", "IN_TRANSIT"].includes(
        delivery.delivery_status
      )
    );
    if (!query.trim()) return available;
    const q = query.toLowerCase();
    return available.filter((delivery) => {
      const pickup = getPickup(delivery).toLowerCase();
      const dropoff = getDropoff(delivery).toLowerCase();
      const customer = String(
        delivery.order?.user?.first_name ??
          delivery.order?.customer?.first_name ??
          delivery.order?.customer_name ??
          ""
      ).toLowerCase();
      return pickup.includes(q) || dropoff.includes(q) || customer.includes(q);
    });
  }, [deliveries, query]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Search Deliveries
            </Text>
            <Pressable
              onPress={() => dispatch(fetchDeliveries({ page: 1, per_page: 50 }))}
              className={`w-9 h-9 rounded-2xl items-center justify-center ${
                isDark ? "bg-neutral-900" : "bg-white"
              }`}
            >
              <Ionicons name="refresh-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
            </Pressable>
          </View>

          <View className={`flex-row items-center rounded-2xl px-3 py-2 shadow-sm ${isDark ? "bg-neutral-900" : "bg-white"}`}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search pickup, dropoff, customer"
              placeholderTextColor="#9CA3AF"
              className={`flex-1 ml-2 font-satoshi text-[14px] ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {logisticsStatus === "loading" && !results.length ? (
            <View className="items-center mt-10">
              <ActivityIndicator color="#F59E0B" />
            </View>
          ) : null}

          {results.map((delivery) => (
            <View
              key={delivery.id}
              className={`rounded-2xl px-4 py-3 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  Delivery #{delivery.id.slice(0, 8)}
                </Text>
                <Text className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {formatNGN(delivery.delivery_fee ?? delivery.earning?.amount ?? 0)}
                </Text>
              </View>
              <Text className={`mt-2 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Pickup: {getPickup(delivery)}
              </Text>
              <Text className={`mt-1 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Dropoff: {getDropoff(delivery)}
              </Text>
              <Text className={`mt-1 text-[12px] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                {delivery.delivery_status}
              </Text>
            </View>
          ))}
          {results.length === 0 && logisticsStatus !== "loading" && (
            <View className="items-center mt-10">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                No deliveries found.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
