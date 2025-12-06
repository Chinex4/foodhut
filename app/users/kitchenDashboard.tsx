import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function KitchenDashboardPlaceholder() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <View
      className={`flex-1 ${isDark ? "bg-neutral-900" : "bg-white"}`}
      style={{ paddingHorizontal: 20, paddingTop: 100 }}
    >
      <View
        className={`rounded-3xl p-5 ${
          isDark ? "bg-neutral-800 border border-neutral-700" : "bg-white border border-neutral-100"
        }`}
        style={{
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <View className="flex-row items-center mb-3">
          <View
            className={`w-11 h-11 rounded-2xl items-center justify-center ${
              isDark ? "bg-neutral-700" : "bg-primary-50"
            }`}
          >
            <Ionicons
              name="storefront-outline"
              size={20}
              color={isDark ? "#FCD34D" : "#F59E0B"}
            />
          </View>
          <Text
            className={`ml-3 text-[18px] font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Kitchen Dashboard
          </Text>
        </View>

        <Text
          className={`${isDark ? "text-neutral-200" : "text-neutral-600"} mb-4 leading-6`}
        >
          Your kitchen is set up! We are preparing the owner dashboard for menus,
          orders, payouts, and performance. You can start accepting orders once
          this space is ready.
        </Text>

        <View className="flex-row">
          <Pressable
            onPress={() => router.push("/users/(tabs)/orders" as any)}
            className={`flex-1 rounded-2xl py-3 items-center ${
              isDark ? "bg-primary-600" : "bg-primary"
            }`}
          >
            <Text className="text-white font-satoshiBold">View Orders</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => router.back()}
        className="mt-6 flex-row items-center"
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={isDark ? "#E5E7EB" : "#111827"}
        />
        <Text
          className={`ml-1 font-satoshiMedium ${
            isDark ? "text-neutral-200" : "text-neutral-800"
          }`}
        >
          Back
        </Text>
      </Pressable>
    </View>
  );
}
