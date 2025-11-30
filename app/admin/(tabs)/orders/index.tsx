import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const TABS = ["Incoming", "Pending", "Completed", "Canceled"] as const;
type OrdersTab = (typeof TABS)[number];

const mockOrders = [
  {
    id: "237895",
    restaurant: "The Tasty Hub",
    amount: "₦2400.04",
    pickupLocation: "FUTO, Owerri",
    contact: "+234 8094 67223",
    status: "Incoming" as OrdersTab,
  },
];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<OrdersTab>("Incoming");

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Orders
          </Text>
        </View>
      </View>

      {/* Segmented tabs */}
      <View className="px-5 flex-row mb-3">
        {TABS.map((name) => {
          const active = name === tab;
          return (
            <Pressable
              key={name}
              onPress={() => setTab(name)}
              className="mr-4 pb-1"
            >
              <Text
                className={`text-[14px] font-satoshi ${
                  active ? "text-neutral-900" : "text-gray-400"
                }`}
              >
                {name}
              </Text>
              {active && <View className="h-1 rounded-full bg-primary mt-1" />}
            </Pressable>
          );
        })}
      </View>

      {/* Search row */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search for Orders"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 font-satoshi text-[13px]"
          />
          <Pressable className="w-8 h-8 rounded-full bg-[#F3F4F6] items-center justify-center">
            <Ionicons name="options-outline" size={16} color="#4B5563" />
          </Pressable>
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {mockOrders
          .filter((o) => o.status === tab)
          .map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/admin/orders/${order.id}`)}
              className="mb-3 rounded-3xl overflow-hidden bg-[#2F241B]"
            >
              <View className="px-4 pt-4 pb-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[16px] font-satoshiBold text-white">
                    {order.restaurant}
                  </Text>
                  <Text className="text-[12px] font-satoshiMedium text-white">
                    {order.amount}
                  </Text>
                </View>
                <Text className="text-[12px] text-gray-200 font-satoshi">
                  Amount:
                </Text>
                <Text className="text-[12px] text-gray-200 font-satoshi mt-1">
                  Time For Pickup: FUTO, Owerri
                </Text>
                <Text className="text-[12px] text-gray-200 font-satoshi mt-1">
                  Contact: {order.contact}
                </Text>
              </View>

              <View className="bg-primary px-4 py-3 items-center">
                <Text className="text-white font-satoshiMedium text-[14px]">
                  View Details
                </Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
