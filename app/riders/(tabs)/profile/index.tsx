import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectMe, selectFetchMeStatus } from "@/redux/users/users.selectors";
import { logout } from "@/redux/auth/auth.thunks";

function Row({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl mb-3 border border-neutral-100"
      android_ripple={{ color: "#eee" }}
    >
      <View className="flex-row items-center">
        {icon}
        <Text
          className={`ml-3 text-[14px] font-satoshi ${
            danger ? "text-red-600" : "text-neutral-900"
          }`}
        >
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? "#DC2626" : "#9CA3AF"}
      />
    </Pressable>
  );
}

export default function RiderProfileScreen() {
  const router = useRouter();
  const me = useAppSelector(selectMe);
  const fetchMe = useAppSelector(selectFetchMeStatus);
  const dispatch = useAppDispatch();

  const fullName =
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") || "—";

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/(auth)/login");
    } catch {
      // errors handled in thunk
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* header / hero */}
      <View className="bg-primary-500 px-5 pb-6 pt-20 rounded-b-3xl">
        <View className="items-center">
          <Image
            source={
              me?.profile_picture_url
                ? { uri: me.profile_picture_url }
                : require("@/assets/images/avatar.png")
            }
            className="w-24 h-24 rounded-full bg-neutral-200"
          />
          <Text className="mt-3 text-neutral-900 text-[18px] font-satoshiBold">
            {fetchMe === "loading" ? "Loading..." : fullName}
          </Text>
          <Text className="mt-1 text-[12px] text-neutral-600 font-satoshi">
            Rider account • ID #{me?.id ?? "—"}
          </Text>

          {/* CTA buttons */}
          <View className="flex-row mt-4">
            <Pressable
              onPress={() => {}}
              className="bg-primary rounded-full px-4 py-2 mr-3 items-center justify-center border border-primary-500"
            >
              <View className="flex-row items-center">
                <Ionicons name="radio-outline" size={16} color="#fff" />
                <Text className="ml-2 text-white font-satoshiMedium">
                  Go Online
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/riders/earnings" as any)}
              className="bg-white rounded-full px-4 py-2 items-center justify-center border border-neutral-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={16} color="#0F172A" />
                <Text className="ml-2 text-neutral-900 font-satoshiMedium">
                  View Earnings
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Account */}
        <Text className="text-neutral-500 font-satoshi px-1 mb-2">
          Account
        </Text>
        <Row
          icon={<Ionicons name="document-text-outline" size={18} color="#9CA3AF" />}
          label="KYC & Verification"
          onPress={() => router.push("/riders/kyc")}
        />
        <Row
          icon={<Ionicons name="bicycle-outline" size={18} color="#9CA3AF" />}
          label="Vehicle Details"
          onPress={() => router.push("/riders/vehicle" as any)}
        />
        <Row
          icon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
          label="Personal Details"
          onPress={() => router.push("/riders/profile/details" as any)}
        />

        {/* Deliveries */}
        <Text className="text-neutral-500 font-satoshi px-1 mt-4 mb-2">
          Deliveries
        </Text>
        <Row
          icon={<Ionicons name="stats-chart-outline" size={18} color="#9CA3AF" />}
          label="Earnings & Payouts"
          onPress={() => router.push("/riders/earnings" as any)}
        />
        <Row
          icon={<Ionicons name="time-outline" size={18} color="#9CA3AF" />}
          label="Ride History"
          onPress={() => router.push("/riders/rides/history" as any)}
        />

        {/* App & support */}
        <Text className="text-neutral-500 font-satoshi px-1 mt-4 mb-2">
          App & Support
        </Text>
        <Row
          icon={<Ionicons name="sparkles-outline" size={18} color="#9CA3AF" />}
          label="What’s New"
          onPress={() => router.push("/riders/whats-new" as any)}
        />
        <Row
          icon={
            <Ionicons name="help-circle-outline" size={18} color="#9CA3AF" />
          }
          label="FAQ’s"
          onPress={() => router.push("/riders/support" as any)}
        />
        <Row
          icon={
            <Ionicons name="chatbubbles-outline" size={18} color="#9CA3AF" />
          }
          label="Get Help"
          onPress={() => router.push("/riders/support" as any)}
        />
        <Row
          icon={
            <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" />
          }
          label="Legal & Privacy"
          onPress={() => router.push("/riders/legal" as any)}
        />

        {/* Danger / sign out */}
        <Row
          icon={<Ionicons name="log-out-outline" size={18} color="#DC2626" />}
          label="Sign Out"
          danger
          onPress={handleLogout}
        />
      </ScrollView>
    </View>
  );
}
