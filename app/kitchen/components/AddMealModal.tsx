import React from "react";
import { ActivityIndicator, Image, Modal, Pressable, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ImagePickerAsset } from "expo-image-picker";

type Props = {
  visible: boolean;
  isDark: boolean;
  name: string;
  desc: string;
  price: string;
  image: ImagePickerAsset | null;
  onChangeName: (v: string) => void;
  onChangeDesc: (v: string) => void;
  onChangePrice: (v: string) => void;
  onPickImage: () => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function AddMealModal({
  visible,
  isDark,
  name,
  desc,
  price,
  image,
  onChangeName,
  onChangeDesc,
  onChangePrice,
  onPickImage,
  onClose,
  onSave,
  saving,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View />
      </Pressable>
      <View
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl p-5 ${
          isDark ? "bg-neutral-900 border-t border-neutral-800" : "bg-white"
        }`}
      >
        <Text className={`text-lg font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Add Meal
        </Text>
        <View className="mt-3 space-y-3">
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="Meal name"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            className={`rounded-2xl px-3 py-3 border ${
              isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-transparent"
            }`}
          />
          <TextInput
            value={desc}
            onChangeText={onChangeDesc}
            placeholder="Description"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            multiline
            className={`rounded-2xl px-3 py-3 border ${
              isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-transparent"
            }`}
          />
          <TextInput
            value={price}
            onChangeText={onChangePrice}
            placeholder="Price (₦)"
            keyboardType="numeric"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            className={`rounded-2xl px-3 py-3 border ${
              isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-transparent"
            }`}
          />
          <Pressable
            onPress={onPickImage}
            className={`h-32 rounded-2xl border items-center justify-center ${
              isDark ? "border-dashed border-neutral-700" : "border-dashed border-neutral-300"
            }`}
          >
            {image ? (
              <Image source={{ uri: image.uri }} className="w-full h-full rounded-2xl" />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={24} color={isDark ? "#E5E7EB" : "#0F172A"} />
                <Text className={isDark ? "text-neutral-300 mt-1" : "text-neutral-700 mt-1"}>
                  Add cover image
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <View className="flex-row mt-4">
          <Pressable
            onPress={onClose}
            className={`flex-1 mr-3 rounded-2xl py-3 items-center ${
              isDark ? "bg-neutral-800" : "bg-neutral-100"
            }`}
          >
            <Text className={isDark ? "text-neutral-200" : "text-neutral-800"}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={saving}
            className={`flex-1 rounded-2xl py-3 items-center justify-center ${
              saving ? "bg-neutral-500" : "bg-primary"
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold">Save</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
