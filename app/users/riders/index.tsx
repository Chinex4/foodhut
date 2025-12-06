// app/users/riders/index.tsx
import { emitRiderPicked } from "@/utils/riderBus.native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import CachedImage from "@/components/ui/CachedImage";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

type Rider = {
  id: string;
  name: string;
  city: string;
  priceLabel: string;
  rating: number;
  avatar?: string;
};
const MOCK: Rider[] = [
  {
    id: "r1",
    name: "Prosper Chichi",
    city: "Aba, Lagos",
    priceLabel: "₦ 1,500–₦ 2,000",
    rating: 5,
  },
  {
    id: "r2",
    name: "Precious Silas",
    city: "Aba, Lagos",
    priceLabel: "₦ 1,500–₦ 2,000",
    rating: 3,
  },
];

export default function RidersList() {
  const [q, setQ] = useState("");
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? MOCK.filter((r) => r.name.toLowerCase().includes(s)) : MOCK;
  }, [q]);

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
            params: { id: item.id },
          })
        }
        className={`rounded-2xl px-3 py-3 mb-3 border ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
        }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <CachedImage
                  uri={item.avatar}
                  fallback={
                    <CachedImage
                      uri={null}
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
      />
    </View>
  );
}
