import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function CreatedAdsListScreen() {
  const router = useRouter();

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
            Created ADs
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
      >
        {[1, 2, 3].map((i) => (
          <Pressable
            key={i}
            onPress={() => router.push("/admin/ads/create")}
            className="bg-white rounded-3xl mb-3 overflow-hidden"
          >
            <View className="m-3 rounded-2xl overflow-hidden bg-gray-200 h-24">
              <Image
                source={require("@/assets/images/banner-placeholder.png")}
                className="w-full h-full"
              />
            </View>
            <View className="px-4 pb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-[14px] font-satoshiMedium text-neutral-900">
                  Pepper Vendor
                </Text>
                <Text className="text-[11px] text-neutral-500 font-satoshi mt-1">
                  Craving Something Delicious...
                </Text>
              </View>
              <View className="flex-row">
                <Pressable className="px-3 py-1 rounded-full bg-red-500 mr-2">
                  <Text className="text-[11px] text-white font-satoshiMedium">
                    Delete
                  </Text>
                </Pressable>
                <Pressable className="px-3 py-1 rounded-full bg-primary">
                  <Text className="text-[11px] text-white font-satoshiMedium">
                    Approve
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* floating add button */}
      <Pressable
        onPress={() => router.push("/admin/ads/create")}
        className="absolute right-6 bottom-24 w-12 h-12 rounded-2xl bg-black items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
