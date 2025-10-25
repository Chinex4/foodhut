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

export default function ProfileHomeScreen() {
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
    } catch (error) {
      // err handled in thunk
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Header / Hero */}
      <View className="bg-primary-500 px-5 pb-5 pt-20">
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

          {/* CTA buttons */}
          <View className="flex-row mt-4">
            <Pressable
              onPress={() => {}}
              className="bg-primary rounded-full px-4 py-2 mr-3 items-center justify-center border border-primary-500"
            >
              <View className="flex-row items-center">
                <Ionicons name="bag-outline" size={16} color="#fff" />
                <Text className="ml-2 text-white font-satoshiMedium">
                  Place Order
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/users/wallet" as any)}
              className="bg-white rounded-full px-4 py-2 items-center justify-center border border-neutral-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={16} color="#0F172A" />
                <Text className="ml-2 text-neutral-900 font-satoshiMedium">
                  View Wallet
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
        {/* Personal */}
        <Text className="text-neutral-500 font-satoshi px-1 mb-2">
          Personal
        </Text>
        <Row
          icon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
          label="Personal Details"
          onPress={() => router.push("/users/profile/details")}
        />
        <Row
          icon={<Ionicons name="location-outline" size={18} color="#9CA3AF" />}
          label="Addresses"
          onPress={() => {}}
        />

        {/* Services */}
        <Text className="text-neutral-500 font-satoshi px-1 mt-4 mb-2">
          Services
        </Text>
        <Row
          icon={
            <Ionicons name="share-social-outline" size={18} color="#9CA3AF" />
          }
          label="Referrals"
          onPress={() => router.push("/users/rewards")}
        />
        <Row
          icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}
          label="Gift Cards"
          onPress={() => router.push("/users/support")}
        />

        {/* More */}
        <Text className="text-neutral-500 font-satoshi px-1 mt-4 mb-2">
          Services
        </Text>
        <Row
          icon={<Ionicons name="sparkles-outline" size={18} color="#9CA3AF" />}
          label="What’s New"
          onPress={() => router.push("/users/support")}
        />
        <Row
          icon={
            <Ionicons name="help-circle-outline" size={18} color="#9CA3AF" />
          }
          label="FAQ’s"
          onPress={() => {}}
        />
        <Row
          icon={
            <Ionicons name="chatbubbles-outline" size={18} color="#9CA3AF" />
          }
          label="Get Help"
          onPress={() => router.push("/users/support")}
        />
        <Row
          icon={
            <Ionicons name="document-text-outline" size={18} color="#9CA3AF" />
          }
          label="Legal"
          onPress={() => router.push("/users/support")}
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
