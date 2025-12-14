import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function GiftCardsScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
      >
        <Pressable onPress={() => router.push("/users/(tabs)/profile")} className="mb-4 flex-row items-center">
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
          <Text
            className={`ml-1 font-satoshiMedium ${
              isDark ? "text-neutral-200" : "text-neutral-900"
            }`}
          >
            Back
          </Text>
        </Pressable>

        <Text
          className={`text-[22px] font-satoshiBold ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          Gift Cards
        </Text>
        <Text
          className={`mt-1 ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          } font-satoshi`}
        >
          Redeem a FoodHut gift card or see the cards you’ve received.
        </Text>

        <View
          className={`mt-6 rounded-3xl p-5 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-primary-50 border-primary-100"
          }`}
        >
          <Text
            className={`text-sm font-satoshi ${
              isDark ? "text-neutral-200" : "text-neutral-600"
            }`}
          >
            Available balance
          </Text>
          <Text
            className={`mt-2 text-3xl font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            ₦0.00
          </Text>
          <Text
            className={`mt-2 ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            Gift card rewards will appear here once added.
          </Text>
        </View>

        <View
          className={`mt-6 rounded-3xl p-4 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text
            className={`font-satoshiMedium ${
              isDark ? "text-neutral-100" : "text-neutral-900"
            }`}
          >
            Redeem a code
          </Text>
          <Text
            className={`mt-1 text-sm ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            Enter the 10–16 digit code from your gift email.
          </Text>

          <View
            className={`mt-4 flex-row items-center rounded-2xl border px-3 ${
              isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <Ionicons name="gift-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="e.g. FOOD-1234-ABCD"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`flex-1 ml-3 py-3 font-satoshi ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            />
          </View>

          <Pressable
            disabled
            className="mt-4 bg-primary rounded-2xl py-3 items-center justify-center opacity-70"
          >
            <Text className="text-white font-satoshiBold">Redeem</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
