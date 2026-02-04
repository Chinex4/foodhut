import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorOutlets } from "@/utils/mock/mockVendor";

export default function KitchenOutletsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [outlets, setOutlets] = useState(mockVendorOutlets);

  const setActive = (id: string) => {
    setOutlets((prev) => prev.map((o) => ({ ...o, active: o.id === id })));
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Outlets
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {outlets.map((outlet) => (
          <View
            key={outlet.id}
            className={`rounded-2xl p-4 mb-3 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {outlet.name}
            </Text>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {outlet.address}
            </Text>
            <View className="flex-row mt-3">
              <Pressable
                onPress={() => setActive(outlet.id)}
                className={`px-3 py-2 rounded-xl ${outlet.active ? "bg-primary" : isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
              >
                <Text className={`${outlet.active ? "text-white" : isDark ? "text-neutral-200" : "text-neutral-700"} text-[12px] font-satoshiMedium`}>
                  {outlet.active ? "Active" : "Make Active"}
                </Text>
              </Pressable>
              <Pressable className="ml-2 px-3 py-2 rounded-xl border border-dashed">
                <Text className={`text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                  Access control
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable className="mt-2 bg-primary rounded-2xl py-4 items-center">
          <Text className="text-white font-satoshiBold">Create Outlet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
