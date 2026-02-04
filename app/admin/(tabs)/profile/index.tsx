import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function AdminProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="bg-primary-500 px-5 pb-6 pt-20 rounded-b-3xl">
        <View className="items-center">
          <Image
            source={require("@/assets/images/avatar.png")}
            className="w-24 h-24 rounded-full bg-neutral-200"
          />
          <Text className="mt-3 text-neutral-900 text-[18px] font-satoshiBold">
            FoodHut Admin
          </Text>
          <Text className="mt-1 text-[12px] text-neutral-600 font-satoshi">
            Manage vendors, riders and orders
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <SectionLabel text="Quick actions" />
        <Row
          icon={<Ionicons name="megaphone-outline" size={18} color="#9CA3AF" />}
          label="Create Notification"
          onPress={() => router.push("/admin/notifications/create" as any)}
        />
        <Row
          icon={<Ionicons name="image-outline" size={18} color="#9CA3AF" />}
          label="Manage Ads"
          onPress={() => router.push("/admin/ads")}
        />
        <Row
          icon={
            <Ionicons name="storefront-outline" size={18} color="#9CA3AF" />
          }
          label="View Vendors"
          onPress={() => router.push("/admin/vendors")}
        />
        <Row
          icon={<Ionicons name="bicycle-outline" size={18} color="#9CA3AF" />}
          label="View Riders"
          onPress={() => router.push("/admin/riders")}
        />
      </ScrollView>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-neutral-500 font-satoshi px-1 mb-2">{text}</Text>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl mb-3 border border-neutral-100"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-3 text-[14px] font-satoshi text-neutral-900">
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}
