import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CachedImageView from "@/components/ui/CachedImage";
import type { Kitchen } from "@/redux/kitchen/kitchen.types";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

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
  const palette = getKitchenPalette(isDark);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
        Kitchen Settings
      </Text>
      <Text className="text-[13px] mt-1" style={{ color: palette.textSecondary }}>
        Update your storefront details and contact info.
      </Text>

      <View
        className="rounded-3xl p-4 mt-5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
          Kitchen Cover
        </Text>
        <Pressable
          onPress={onUpdateCover}
          className="mt-3 h-44 rounded-2xl overflow-hidden items-center justify-center"
          style={{ borderWidth: 1, borderStyle: "dashed", borderColor: palette.accentStrong, backgroundColor: palette.surfaceAlt }}
        >
          {kitchen?.cover_image ? (
            <CachedImageView
              uri={typeof kitchen.cover_image === "string" ? kitchen.cover_image : kitchen.cover_image?.url}
              className="w-full h-full"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={28} color={palette.accentStrong} />
              <Text className="font-satoshiBold mt-1" style={{ color: palette.accentStrong }}>
                Upload cover image
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View
        className="rounded-3xl p-4 mt-4"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
          Profile Details
        </Text>

        {[{ label: "Kitchen Name", value: kitchenName, onChange: onChangeName },
          { label: "Phone Number", value: kitchenPhone, onChange: onChangePhone },
          { label: "Address", value: kitchenAddress, onChange: onChangeAddress, multiline: true }].map((field) => (
          <View key={field.label} className="mt-4">
            <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              multiline={field.multiline}
              placeholder={field.label}
              placeholderTextColor={palette.textMuted}
              className={`rounded-2xl px-3 py-3 font-satoshi text-[15px] ${field.multiline ? "min-h-[100px]" : ""}`}
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
              textAlignVertical={field.multiline ? "top" : "center"}
            />
          </View>
        ))}

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="mt-5 rounded-2xl py-4 items-center justify-center"
          style={{ backgroundColor: saving ? palette.textMuted : palette.accent }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold text-[16px]">Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
