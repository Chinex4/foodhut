import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

type RideStatus = "ongoing" | "completed";

const mockRides = [
  {
    id: "#237895",
    date: "01 Aug 2025, 2:25PM",
    pickup: "12, Kaduri street, Lagos",
    dropoff: "1, Umu street, Lagos",
    amount: "₦3,000.04",
    status: "ongoing" as RideStatus,
  },
  {
    id: "#214578",
    date: "31 Jul 2025, 6:10PM",
    pickup: "2, Adebayo street, Lagos",
    dropoff: "45, Herbert Macaulay, Lagos",
    amount: "₦2,560.00",
    status: "completed" as RideStatus,
  },
  {
    id: "#214579",
    date: "30 Jul 2025, 4:00PM",
    pickup: "Shoprite, Lekki, Lagos",
    dropoff: "Phase 1 estate, Lagos",
    amount: "₦4,000.01",
    status: "completed" as RideStatus,
  },
];

export default function RiderRidesScreen() {
  const [filter, setFilter] = useState<RideStatus | "all">("ongoing");

  const filtered = mockRides.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-satoshiBold text-black mb-3">
          Rides
        </Text>

        {/* segmented filters */}
        <View className="flex-row bg-white rounded-full p-1">
          {[
            { key: "ongoing" as const, label: "Ongoing" },
            { key: "completed" as const, label: "Completed" },
            { key: "all" as const, label: "All" },
          ].map((opt) => {
            const active = filter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setFilter(opt.key)}
                className={`flex-1 px-3 py-1.5 rounded-full items-center ${
                  active ? "bg-primary" : ""
                }`}
              >
                <Text
                  className={`text-[12px] font-satoshiMedium ${
                    active ? "text-white" : "text-neutral-700"
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
        {filtered.map((ride) => (
          <View
            key={ride.id}
            className="bg-white rounded-3xl px-4 py-4 mb-3 border border-neutral-100"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[13px] font-satoshiMedium text-neutral-900">
                Order ID: {ride.id}
              </Text>
              <Text className="text-[11px] font-satoshi text-neutral-500">
                {ride.date}
              </Text>
            </View>

            <View className="flex-row mt-2">
              <View className="items-center mr-3">
                <View className="w-2 h-2 rounded-full bg-primary mb-1" />
                <View className="w-0.5 flex-1 bg-neutral-200" />
                <View className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
              </View>
              <View className="flex-1">
                <Text className="text-[12px] font-satoshi text-neutral-500">
                  Pickup
                </Text>
                <Text className="text-[13px] font-satoshiMedium text-neutral-900 mb-2">
                  {ride.pickup}
                </Text>
                <Text className="text-[12px] font-satoshi text-neutral-500">
                  Dropoff
                </Text>
                <Text className="text-[13px] font-satoshiMedium text-neutral-900">
                  {ride.dropoff}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color="#111827"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-[13px] font-satoshiMedium text-neutral-900">
                  {ride.amount}
                </Text>
              </View>

              <View className="flex-row items-center">
                <StatusPill status={ride.status} />
                <Pressable className="ml-3 flex-row items-center">
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#D1D5DB"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View className="mt-10 items-center">
            <Ionicons name="bicycle-outline" size={42} color="#D1D5DB" />
            <Text className="mt-3 text-[13px] text-neutral-500 font-satoshi">
              No rides in this category yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusPill({ status }: { status: RideStatus }) {
  const isOngoing = status === "ongoing";
  const bg = isOngoing ? "bg-amber-100" : "bg-emerald-100";
  const text = isOngoing ? "text-amber-700" : "text-emerald-700";
  const label = isOngoing ? "Ongoing" : "Completed";

  return (
    <View className={`px-3 py-1 rounded-full ${bg}`}>
      <Text className={`text-[11px] font-satoshiMedium ${text}`}>{label}</Text>
    </View>
  );
}
