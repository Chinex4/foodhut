import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function RiderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Riders Details
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <View className="items-center mb-4">
          <View className="w-28 h-28 rounded-full overflow-hidden bg-gray-300 mb-2">
            <Image
              source={require("@/assets/images/avatar.png")}
              className="w-full h-full"
            />
          </View>
          <Text className="text-[16px] font-satoshiBold text-neutral-900">
            Oga Solo
          </Text>
        </View>

        <DetailRow label="Rider Name" value="Pepper Chi" />
        <DetailRow label="Phone Number" value="+234 8091 345 678" />
        <DetailRow label="Address" value="1, Kadi Street, Ogun, Lagos" />
        <DetailRow label="Date of SignUp" value="01/03/2023" />
        <DetailRow label="Total Number of Rides" value="145" />
        <DetailRow label="Routes" value="FUTO" />
        <View className="flex-row mt-2">
          <View className="flex-1 mr-2">
            <DetailRow label="Open Time" value="8:30 AM" />
          </View>
          <View className="flex-1 ml-2">
            <DetailRow label="Closing Time" value="9:00 PM" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] text-neutral-500 font-satoshi">{label}</Text>
      <View className="mt-1 bg-white rounded-2xl px-3 py-2">
        <Text className="text-[12px] font-satoshi text-neutral-900">
          {value}
        </Text>
      </View>
    </View>
  );
}
