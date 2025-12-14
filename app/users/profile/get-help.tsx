import React from "react";
import { View, Text, Pressable, Linking, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

const SUPPORT_EMAIL = "support@foodhut.co";
const SUPPORT_PHONE = "+2348090000000";
const SUPPORT_WHATSAPP = "2348090000000";

export default function GetHelpScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const openPhone = async () => {
    const url = `tel:${SUPPORT_PHONE}`;
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    Alert.alert("Call not available", "Please reach us by email instead.");
  };

  const openWhatsApp = async () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=Hi%20FoodHut%20support`;
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    Alert.alert("WhatsApp not available", "Please try email or phone.");
  };

  const openEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}`;
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    Alert.alert("Email app not available", "Copy the address: support@foodhut.co");
  };

  const cardBase = `rounded-3xl p-4 border ${
    isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
  }`;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
          Get Help
        </Text>
        <Text
          className={`mt-1 ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          } font-satoshi`}
        >
          Choose how you’d like to reach us. We respond quickly during working hours.
        </Text>

        <View className="mt-6 space-y-3">
          <Pressable onPress={openWhatsApp} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    WhatsApp
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    Chat with support instantly
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>

          <Pressable onPress={openPhone} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="call-outline" size={18} color="#F59E0B" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    Call Support
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {SUPPORT_PHONE}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>

          <Pressable onPress={openEmail} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="mail-outline" size={18} color="#3B82F6" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    Email Us
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {SUPPORT_EMAIL}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
