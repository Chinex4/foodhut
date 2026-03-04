import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorMeals } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showError, showSuccess } from "@/components/ui/toast";

export default function KitchenEditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const meal = useMemo(() => mockVendorMeals.find((item) => item.id === id), [id]);

  const [name, setName] = useState(meal?.name ?? "");
  const [price, setPrice] = useState(meal?.price?.replace(/[^0-9.]/g, "") ?? "");
  const [portion, setPortion] = useState(meal?.portion ?? "Regular");
  const [desc, setDesc] = useState(meal?.description ?? "");
  const [available, setAvailable] = useState(meal?.available ?? true);
  const [mealImageUri, setMealImageUri] = useState<string | null>(null);

  const pickMealImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      setMealImageUri(result.assets[0]?.uri ?? null);
      showSuccess("Meal image selected");
    } catch (err: any) {
      showError(err?.message || "Failed to upload image");
    }
  };

  const save = () => {
    showSuccess("Meal updated");
    router.back();
  };

  if (!meal) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle" size={28} color={palette.danger} />
        <Text className="mt-2 font-satoshiBold text-[18px]" style={{ color: palette.textPrimary }}>
          Meal not found
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-2xl px-5 py-3" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white font-satoshiBold">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-20 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Edit Meal
          </Text>
        </View>

        <Pressable className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? palette.dangerSoft : "#FFF1F2" }}>
          <Ionicons name="trash-outline" size={18} color={palette.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
            Meal name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Price
          </Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Portion type
          </Text>
          <View className="flex-row items-center">
            {(["Single", "Regular", "Large"] as const).map((item) => {
              const active = portion === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setPortion(item)}
                  className="rounded-full px-4 py-2 mr-2"
                  style={{
                    backgroundColor: active ? palette.accentSoft : palette.surfaceAlt,
                    borderWidth: 1,
                    borderColor: active ? palette.accentStrong : palette.border,
                  }}
                >
                  <Text className="text-[12px] font-satoshiBold" style={{ color: active ? palette.accentStrong : palette.textSecondary }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Description
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            textAlignVertical="top"
            className="rounded-2xl px-3 py-3 text-[15px] min-h-[110px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <View
            className="rounded-2xl mt-4 p-4"
            style={{
              backgroundColor: isDark ? palette.elevated : "#FFF5E2",
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cloud-upload-outline" size={20} color={palette.accentStrong} />
                <Text className="ml-2 font-satoshiBold" style={{ color: palette.accentStrong }}>
                  Upload meal image
                </Text>
              </View>
              <Pressable onPress={pickMealImage}>
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  {mealImageUri ? "Change" : "Browse"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={pickMealImage}
              className="mt-3 rounded-2xl overflow-hidden items-center justify-center"
              style={{
                backgroundColor: palette.surfaceAlt,
                borderWidth: mealImageUri ? 0 : 1,
                borderStyle: "dashed",
                borderColor: palette.border,
                minHeight: 120,
              }}
            >
              {mealImageUri ? (
                <Image source={{ uri: mealImageUri }} className="w-full h-[140px]" resizeMode="cover" />
              ) : (
                <View className="items-center py-6">
                  <Ionicons name="image-outline" size={24} color={palette.textMuted} />
                  <Text className="mt-2 text-[13px] font-satoshiMedium" style={{ color: palette.textSecondary }}>
                    Tap to select an image
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                In stock
              </Text>
              <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
                Hide meal automatically when unavailable
              </Text>
            </View>

            <Switch
              value={available}
              onValueChange={setAvailable}
              thumbColor={available ? palette.accent : "#F8FAFC"}
              trackColor={{ false: "#CBD5E1", true: isDark ? "#5A4512" : "#F6C56B" }}
              ios_backgroundColor="#CBD5E1"
            />
          </View>
        </View>

        <Pressable onPress={save} className="mt-5 rounded-2xl py-4 items-center" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white font-satoshiBold text-[16px]">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
