import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

type Tab = "profile" | "menu";

export default function VendorDetailsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

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
            Vendor Details
          </Text>
        </View>
      </View>

      {/* tabs */}
      <View className="px-5 mb-3">
        <View className="flex-row bg-white rounded-full p-1">
          {(["profile", "menu"] as Tab[]).map((key) => {
            const active = key === tab;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={`flex-1 px-3 py-1.5 rounded-full items-center ${
                  active ? "bg-primary" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-satoshiMedium ${
                    active ? "text-white" : "text-neutral-700"
                  }`}
                >
                  {key === "profile" ? "Profile" : "Menu"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === "profile" ? <ProfileTab /> : <MenuTab />}
    </SafeAreaView>
  );
}

function ProfileTab() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <View className="bg-white rounded-3xl px-4 py-4 mb-4">
        <View className="rounded-2xl overflow-hidden bg-gray-200 h-32 mb-4">
          <Image
            source={require("@/assets/images/banner-placeholder.png")}
            className="w-full h-full"
          />
        </View>
        <Info label="Business Name" value="Pepper Chi" />
        <Info label="Phone Number" value="+234 8091 345 678" />
        <Info label="Address" value="1, Kadi Street, Ogun, Lagos" />
        <Info label="Date of SignUp" value="01/03/2023" />
        <Info label="Total Number of Orders" value="145" />
        <View className="flex-row mt-3">
          <View className="flex-1 mr-2">
            <Info label="Open Time" value="8:30 AM" />
          </View>
          <View className="flex-1 ml-2">
            <Info label="Closing Time" value="9:00 PM" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function MenuTab() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <View className="bg-white rounded-3xl px-4 py-4 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Opens
          </Text>
          <Text className="text-[12px] font-satoshiMedium text-neutral-900">
            11:00am
          </Text>
        </View>
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Preparation Time
          </Text>
          <Text className="text-[12px] font-satoshiMedium text-neutral-900">
            28 - 38 mins
          </Text>
        </View>
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Delivery Type
          </Text>
          <Text className="text-[12px] font-satoshiMedium text-neutral-900">
            Instant & Scheduled
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Rating
          </Text>
          <Text className="text-[12px] font-satoshiMedium text-neutral-900">
            2.5
          </Text>
          <Pressable className="mt-1 px-3 py-1 rounded-full bg-amber-500">
            <Text className="text-[11px] text-white font-satoshiMedium">
              Block
            </Text>
          </Pressable>
        </View>
      </View>

      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-row bg-white rounded-3xl px-4 py-3 mb-3">
          <View className="w-16 h-16 rounded-2xl bg-gray-300 mr-3" />
          <View className="flex-1">
            <Text className="text-[13px] font-satoshiMedium text-neutral-900">
              Sushi rolls made with vinegared rice and seaweed (nori)
            </Text>
            <Text className="text-[11px] text-neutral-500 font-satoshi mt-1">
              Sushi rolls made with vinegared rice and seaweed (nori)...
            </Text>
            <Text className="text-[12px] font-satoshiBold text-neutral-900 mt-1">
              NGN 5,500
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] text-neutral-500 font-satoshi">{label}</Text>
      <View className="mt-1 bg-[#F3F4F6] rounded-2xl px-3 py-2">
        <Text className="text-[12px] text-neutral-900 font-satoshi">
          {value}
        </Text>
      </View>
    </View>
  );
}
