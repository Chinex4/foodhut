import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockRiderProfile } from "@/utils/mock/mockRider";

export default function RiderKycScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          KYC
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          className={`rounded-2xl p-4 mb-4 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Status
          </Text>
          <Text className={`text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {mockRiderProfile.kycStatus}
          </Text>
        </View>

        {[
          "Government ID (Front)",
          "Government ID (Back)",
          "Selfie with ID",
          "Proof of Address",
        ].map((item) => (
          <View
            key={item}
            className={`rounded-2xl p-4 mb-3 border border-dashed ${
              isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`${isDark ? "text-neutral-200" : "text-neutral-800"} font-satoshiMedium`}>
                {item}
              </Text>
              <Ionicons name="cloud-upload-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
            </View>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Upload placeholder
            </Text>
          </View>
        ))}

        <Pressable className="bg-primary rounded-2xl py-4 items-center">
          <Text className="text-white font-satoshiBold">Submit KYC</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
