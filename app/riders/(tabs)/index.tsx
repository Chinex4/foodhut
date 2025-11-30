import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import KycPromptModal from "@/components/riders/KycPromptModal";

const mockIncomingRide = {
  id: "#237895",
  pickup: "12, Kaduri street, Lagos",
  address: "1, Umu street, Lagos",
  contact: "+234 809 260 4955",
  eta: "5:00PM",
  contents: "2x Pasta",
};

const mockDeliveries = [
  { id: "#214578", amount: "₦3,000.04", status: "Delivered" },
  { id: "#214579", amount: "₦9,000.02", status: "Delivered" },
  { id: "#214580", amount: "₦2,560.00", status: "Delivered" },
  { id: "#214581", amount: "₦4,000.01", status: "Delivered" },
];

export default function RiderHomeScreen() {
  const router = useRouter();

  // TODO: replace with value from API / redux
  const hasCompletedKyc = false;

  const [showKycModal, setShowKycModal] = useState(false);

  // show modal every 10s as long as KYC is not done
  useEffect(() => {
    if (hasCompletedKyc) return;

    const interval = setInterval(() => {
      setShowKycModal(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [hasCompletedKyc]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center mr-3">
              {/* Placeholder avatar */}
              <Text className="text-lg font-satoshiBold text-black">F</Text>
            </View>
            <View>
              <Text className="text-lg font-satoshiBold text-black">
                Hi Faith
              </Text>
              <Text className="text-xs font-satoshi text-gray-500">
                Welcome back 👋
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable className="w-10 h-10 rounded-2xl bg-white items-center justify-center">
              <Ionicons name="gift-outline" size={20} color="#111827" />
            </Pressable>
            <Pressable className="w-10 h-10 rounded-2xl bg-white items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* Earnings cards */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-[#FFE7BA] rounded-3xl px-4 py-3">
            <Text className="text-xs font-satoshi text-gray-700 mb-1">
              Today’s earnings
            </Text>
            <Text className="text-xl font-satoshiBold text-black">
              ₦240,573.04
            </Text>
          </View>
          <View className="flex-1 bg-[#FFD3C4] rounded-3xl px-4 py-3">
            <Text className="text-xs font-satoshi text-gray-700 mb-1">
              Weekly earnings
            </Text>
            <Text className="text-xl font-satoshiBold text-black">
              ₦5,573.04
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#FFE1A7] rounded-3xl px-4 py-3">
            <Text className="text-xs font-satoshi text-gray-700 mb-1">
              Total earnings
            </Text>
            <Text className="text-xl font-satoshiBold text-black">
              ₦240,000.04
            </Text>
          </View>
          <View className="flex-1 bg-[#FFE1A7] rounded-3xl px-4 py-3">
            <Text className="text-xs font-satoshi text-gray-700 mb-1">
              Total earnings
            </Text>
            <Text className="text-xl font-satoshiBold text-black">
              ₦240,000.04
            </Text>
          </View>
        </View>

        {/* Incoming ride card */}
        <Text className="text-base font-satoshiBold text-black mb-2">
          Incoming Rides
        </Text>

        <View className="bg-white rounded-3xl p-16px px-5 py-4 mb-6 border border-[#FFD7A3]">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-satoshi text-gray-600">Order ID</Text>
            <Text className="text-sm font-satoshiMedium text-black">
              {mockIncomingRide.id}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-satoshi text-gray-600">
              Pickup Location
            </Text>
            <Text className="text-sm font-satoshiMedium text-right text-black flex-1 ml-4">
              {mockIncomingRide.pickup}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-satoshi text-gray-600">
              Customer address
            </Text>
            <Text className="text-sm font-satoshiMedium text-right text-black flex-1 ml-4">
              {mockIncomingRide.address}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-satoshi text-gray-600">
              Customer contact
            </Text>
            <Text className="text-sm font-satoshiMedium text-black">
              {mockIncomingRide.contact}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-satoshi text-gray-600">
              Estimated distance/time
            </Text>
            <Text className="text-sm font-satoshiMedium text-black">
              {mockIncomingRide.eta}
            </Text>
          </View>
          <View className="flex-row justify-between mb-5">
            <Text className="text-sm font-satoshi text-gray-600">
              Order contents
            </Text>
            <Text className="text-sm font-satoshiMedium text-black">
              {mockIncomingRide.contents}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Pressable className="flex-1 border border-primary rounded-2xl py-3 items-center">
              <Text className="text-primary font-satoshiMedium">Reject</Text>
            </Pressable>
            <Pressable className="flex-1 bg-primary rounded-2xl py-3 items-center">
              <Text className="text-white font-satoshiMedium">Accept</Text>
            </Pressable>
          </View>
        </View>

        {/* Delivery list */}
        <Text className="text-base font-satoshiBold text-black mb-2">
          Delivery
        </Text>

        {mockDeliveries.map((d) => (
          <View
            key={d.id + d.amount}
            className="flex-row items-center bg-white rounded-3xl px-4 py-3 mb-3"
          >
            <View className="w-10 h-10 rounded-full bg-primary mr-3" />
            <View className="flex-1">
              <Text className="text-sm font-satoshiMedium text-black">
                Order ID: {d.id}
              </Text>
              <Text className="text-[11px] text-gray-500 font-satoshi">
                01 Aug 2025, 2:25PM
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-satoshiMedium text-black mb-1">
                {d.amount}
              </Text>
              <View className="px-3 py-1 rounded-full bg-emerald-200">
                <Text className="text-[11px] text-emerald-800 font-satoshiMedium">
                  {d.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <KycPromptModal
        visible={showKycModal && !hasCompletedKyc}
        onClose={() => setShowKycModal(false)}
        onContinue={() => {
          setShowKycModal(false);
          router.push("/riders/kyc" as any);
        }}
      />
    </SafeAreaView>
  );
}
