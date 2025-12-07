import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CachedImage from "@/components/ui/CachedImage";
import type { Kitchen } from "@/redux/kitchen/kitchen.types";

type Props = {
  kitchen: Kitchen | null;
  isDark: boolean;
  kitchenName: string;
  kitchenPhone: string;
  kitchenAddress: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeAddress: (v: string) => void;
  onUpdateCover: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function SettingsTab({
  kitchen,
  isDark,
  kitchenName,
  kitchenPhone,
  kitchenAddress,
  onChangeName,
  onChangePhone,
  onChangeAddress,
  onUpdateCover,
  onSave,
  saving,
}: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View
        className={`rounded-3xl p-4 mb-4 border ${
          isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-100"
        }`}
      >
        <Text
          className={`font-satoshiBold text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          Kitchen Cover
        </Text>
        <Pressable
          onPress={onUpdateCover}
          className="mt-3 h-40 rounded-2xl overflow-hidden border border-dashed border-primary items-center justify-center bg-neutral-50"
        >
          {kitchen?.cover_image.url ? (
            <Image
              source={{ uri: kitchen.cover_image.url }}
              className="w-full h-full"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={28} color="#F59E0B" />
              <Text className="text-primary font-satoshiMedium mt-1">
                Upload cover
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View
        className={`rounded-3xl p-4 border ${
          isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-100"
        }`}
      >
        <Text
          className={`font-satoshiBold text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          Details
        </Text>
        <View className="mt-3 space-y-3">
          <View
            className={`rounded-2xl border px-3 py-3 ${
              isDark
                ? "bg-neutral-800 border-neutral-700"
                : "bg-neutral-100 border-transparent"
            }`}
          >
            <Text
              className={
                isDark ? "text-neutral-400 mb-1" : "text-neutral-500 mb-1"
              }
            >
              Name
            </Text>
            <TextInput
              value={kitchenName}
              onChangeText={onChangeName}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
              placeholder="Kitchen name"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
          <View
            className={`rounded-2xl border px-3 py-3 ${
              isDark
                ? "bg-neutral-800 border-neutral-700"
                : "bg-neutral-100 border-transparent"
            }`}
          >
            <Text
              className={
                isDark ? "text-neutral-400 mb-1" : "text-neutral-500 mb-1"
              }
            >
              Phone
            </Text>
            <TextInput
              value={kitchenPhone}
              onChangeText={onChangePhone}
              keyboardType="phone-pad"
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
              placeholder="Phone number"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
          <View
            className={`rounded-2xl border px-3 py-3 ${
              isDark
                ? "bg-neutral-800 border-neutral-700"
                : "bg-neutral-100 border-transparent"
            }`}
          >
            <Text
              className={
                isDark ? "text-neutral-400 mb-1" : "text-neutral-500 mb-1"
              }
            >
              Address
            </Text>
            <TextInput
              value={kitchenAddress}
              onChangeText={onChangeAddress}
              multiline
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
              placeholder="Address"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving}
          className={`mt-4 rounded-2xl py-3 items-center justify-center ${
            saving ? "bg-neutral-500" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold">Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
