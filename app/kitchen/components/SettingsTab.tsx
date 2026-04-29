import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CachedImageView from "@/components/ui/CachedImage";
import type { Kitchen } from "@/redux/kitchen/kitchen.types";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

type Props = {
  kitchen: Kitchen | null;
  isDark: boolean;
  closingTime: string;
  isAvailable: boolean;
  onChangeClosingTime: (v: string) => void;
  onChangeAvailable: (v: boolean) => void;
  onUpdateCover: () => void;
  onUpdateProfilePic: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function SettingsTab({
  kitchen,
  isDark,
  closingTime,
  isAvailable,
  onChangeClosingTime,
  onChangeAvailable,
  onUpdateCover,
  onUpdateProfilePic,
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
        Update your storefront status and closing time.
      </Text>

      <View
        className="rounded-3xl p-4 mt-5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
          Photos
        </Text>
        
        {/* Profile Pic */}
        <View className="items-center my-4">
          <Pressable
            onPress={onUpdateProfilePic}
            className="w-24 h-24 rounded-full overflow-hidden items-center justify-center"
            style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}
          >
            {kitchen?.profile_picture ? (
              <CachedImageView
                uri={typeof kitchen.profile_picture === "string" ? kitchen.profile_picture : kitchen.profile_picture?.url}
                className="w-full h-full"
              />
            ) : (
              <Ionicons name="person-outline" size={32} color={palette.accentStrong} />
            )}
            <View className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-white">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </Pressable>
          <Text className="text-[12px] mt-2 font-satoshiMedium" style={{ color: palette.textSecondary }}>
            Kitchen Logo / Profile
          </Text>
        </View>

        <Text className="font-satoshiBold text-[14px] mt-2" style={{ color: palette.textPrimary }}>
          Cover Banner
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

        <View className="mt-4">
          <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
            Closing Time
          </Text>
          <TextInput
            value={closingTime}
            onChangeText={onChangeClosingTime}
            placeholder="12:00"
            placeholderTextColor={palette.textMuted}
            className="rounded-2xl px-3 py-3 font-satoshi text-[15px]"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />
        </View>

        <View
          className="mt-4 rounded-2xl px-3 py-3 flex-row items-center justify-between"
          style={{ backgroundColor: palette.surfaceAlt }}
        >
          <View className="flex-1 pr-3">
            <Text className="font-satoshiBold text-[15px]" style={{ color: palette.textPrimary }}>
              Accepting Orders
            </Text>
            <Text className="mt-1 text-[12px]" style={{ color: palette.textSecondary }}>
              Turn this off when your kitchen is unavailable.
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={onChangeAvailable}
            trackColor={{ false: palette.border, true: palette.accentSoft }}
            thumbColor={isAvailable ? palette.accent : palette.textMuted}
          />
        </View>

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
