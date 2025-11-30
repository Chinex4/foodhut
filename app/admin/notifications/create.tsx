import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function NotificationCreateScreen() {
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
            Notification
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <Text className="text-[13px] font-satoshiMedium text-neutral-900 mb-2">
          Flyer Banner
        </Text>
        <View className="rounded-3xl border-2 border-dashed border-primary px-4 py-6 items-center mb-5">
          <Text className="text-[13px] font-satoshi text-neutral-700 mb-4">
            Drag and drop pictures here
          </Text>
          <View className="px-6 py-2 rounded-2xl bg-primary">
            <Text className="text-white font-satoshiMedium text-[13px]">
              Upload Image
            </Text>
          </View>
        </View>

        <Label text="Title" />
        <Input placeholder="Enter Title" />

        <Label text="Details" />
        <Multiline placeholder="Craving something delicious?..." />

        <Label text="Link" />
        <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-3 py-3">
          <TextInput
            placeholder="https://www.fooodhut.com/nj_006"
            className="flex-1 font-satoshi text-[13px]"
            placeholderTextColor="#9CA3AF"
          />
          <Ionicons name="copy-outline" size={18} color="#4B5563" />
        </View>

        <Pressable className="mt-8 bg-primary rounded-2xl py-4 items-center">
          <Text className="text-white font-satoshiMedium text-[15px]">
            Upload
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text className="text-[13px] font-satoshiMedium text-neutral-900 mt-3 mb-1">
      {text}
    </Text>
  );
}

function Input({ placeholder }: { placeholder: string }) {
  return (
    <TextInput
      placeholder={placeholder}
      className="bg-[#F3F4F6] rounded-2xl px-3 py-3 font-satoshi text-[13px]"
      placeholderTextColor="#9CA3AF"
    />
  );
}

function Multiline({ placeholder }: { placeholder: string }) {
  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholder={placeholder}
      className="bg-[#F3F4F6] rounded-2xl px-3 py-3 font-satoshi text-[13px]"
      placeholderTextColor="#9CA3AF"
    />
  );
}
