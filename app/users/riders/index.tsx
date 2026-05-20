// app/users/riders/index.tsx
import { emitRiderPicked } from "@/utils/riderBus.native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import CachedImageView from "@/components/ui/CachedImage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectLogisticsError,
  selectLogisticsRiders,
  selectLogisticsStatus,
} from "@/redux/logistics/logistics.selectors";
import { fetchLogisticsRiders } from "@/redux/logistics/logistics.thunks";
import type { LogisticsRider } from "@/redux/logistics/logistics.types";

type Rider = {
  id: string;
  name: string;
  city: string;
  priceLabel: string;
  rating: number;
  avatar?: string;
};

const riderName = (rider: LogisticsRider) => {
  const fullName = [rider.user?.first_name, rider.user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || rider.user?.email || `Rider #${rider.id.slice(0, 6)}`;
};

const toRiderCard = (rider: LogisticsRider): Rider => ({
  id: rider.id,
  name: riderName(rider),
  city: rider.logistics_company?.name
    ? rider.logistics_company.name
    : rider.is_available
      ? "Available"
      : "Unavailable",
  priceLabel: "Make offer",
  rating: rider.kyc?.verification_status === "VERIFIED" ? 5 : 0,
});

export default function RidersList() {
  const [q, setQ] = useState("");
  const { order_id } = useLocalSearchParams<{ order_id?: string }>();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const riders = useAppSelector(selectLogisticsRiders);
  const status = useAppSelector(selectLogisticsStatus);
  const error = useAppSelector(selectLogisticsError);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchLogisticsRiders({
          page: 1,
          per_page: 50,
          is_available: true,
          search: q.trim() || undefined,
        })
      );
    }, 250);
    return () => clearTimeout(timeout);
  }, [dispatch, q]);

  const data = useMemo(() => {
    const mapped = riders.map(toRiderCard);
    const s = q.trim().toLowerCase();
    return s ? mapped.filter((r) => r.name.toLowerCase().includes(s)) : mapped;
  }, [q, riders]);

  const render = ({ item }: { item: Rider }) => {
    const onPick = () => {
      emitRiderPicked(item);
      router.back(); // return to checkout
    };
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/users/riders/[id]",
            params: { id: item.id, order_id },
          })
        }
        className={`rounded-2xl px-3 py-3 mb-3 border ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
        }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <CachedImageView
                  uri={item.avatar}
                  fallback={
                    <View
                      className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                    />
                  }
                  className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                />
            <View className="ml-3">
              <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                {item.name}
              </Text>
              <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Location: {item.city}
              </Text>
              <View className="flex-row mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < item.rating ? "star" : "star-outline"}
                    size={14}
                    color={i < item.rating ? "#f59e0b" : isDark ? "#4b5563" : "#d1d5db"}
                  />
                ))}
              </View>
            </View>
          </View>

          <View
            className={`px-3 py-1 rounded-lg ${
              isDark ? "bg-neutral-800" : "bg-neutral-900"
            }`}
          >
            <Text className={`font-satoshiMedium ${isDark ? "text-neutral-100" : "text-white"}`}>
              {item.priceLabel}
            </Text>
          </View>
        </View>

        {/* Quick pick */}
        <Pressable
          onPress={onPick}
          className="mt-3 bg-primary rounded-xl py-3 items-center justify-center"
        >
          <Text className="text-white font-satoshiBold">Send A Request</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View className={`flex-1 pt-20 px-5 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
        </Pressable>
        <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Your Orders
        </Text>
        <View className="flex-1" />
        <Text className={`font-satoshi ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
          Delivery & Payment
        </Text>
      </View>

      {/* search */}
      <View
        className={`flex-row items-center rounded-full px-3 py-2 mb-3 border ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100 border-transparent"
        }`}
      >
        <Ionicons name="search" size={16} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
        <TextInput
          placeholder="Search for Riders"
          value={q}
          onChangeText={setQ}
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          className={`ml-2 flex-1 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
        />
        <Ionicons name="options-outline" size={16} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        renderItem={render}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          status === "loading" ? (
            <View className="py-5 items-center">
              <ActivityIndicator color="#ffa800" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          status !== "loading" ? (
            <View className="items-center mt-10">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                {error || "No available riders found."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
