import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { createMeal, fetchMeals } from "@/redux/meals/meals.thunks";
import { selectMealCreateStatus } from "@/redux/meals/meals.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectKitchenProfile } from "@/redux/kitchen/kitchen.selectors";
import { fetchKitchenProfile } from "@/redux/kitchen/kitchen.thunks";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showError, showSuccess } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function KitchenCreateMealScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);
  const createStatus = useAppSelector(selectMealCreateStatus);
  const kitchen = useAppSelector(selectKitchenProfile);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [mealImageUri, setMealImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!kitchen) {
      dispatch(fetchKitchenProfile());
    }
  }, [dispatch, kitchen]);

  const canSave = useMemo(() => {
    const amount = Number(price);
    return (
      name.trim().length > 0 &&
      desc.trim().length > 0 &&
      Number.isFinite(amount) &&
      amount > 0 &&
      !!mealImageUri &&
      createStatus !== "loading"
    );
  }, [createStatus, desc, mealImageUri, name, price]);

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
    } catch (error: any) {
      showError(error?.message || "Failed to select image");
    }
  };

  const onSave = async () => {
    if (!canSave || !mealImageUri) return;
    try {
      const fileName = mealImageUri.split("/").pop() || "meal.jpg";
      await dispatch(
        createMeal({
          name: name.trim(),
          description: desc.trim(),
          price: Number(price),
          cover: {
            uri: mealImageUri,
            name: fileName,
            type: "image/jpeg",
          },
        })
      ).unwrap();

      if (kitchen?.id) {
        await dispatch(
          fetchMeals({
            page: 1,
            per_page: 200,
            kitchen_id: kitchen.id,
          })
        );
      }

      showSuccess("Meal created");
      router.back();
    } catch (error: any) {
      showError(error?.message || "Failed to create meal");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-20 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Create Meal
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          className="rounded-3xl p-4"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
            Meal name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Green Goddess Bowl"
            placeholderTextColor={palette.textMuted}
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Price
          </Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="1000"
            placeholderTextColor={palette.textMuted}
            keyboardType="numeric"
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Description
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Fresh kale, avocado and citrus dressing."
            placeholderTextColor={palette.textMuted}
            multiline
            textAlignVertical="top"
            className="rounded-2xl px-3 py-3 text-[15px] min-h-[110px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <View
            className="rounded-2xl mt-4 p-4"
            style={{ backgroundColor: isDark ? palette.elevated : "#FFF5E2", borderWidth: 1, borderColor: palette.border }}
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
        </View>

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className="mt-5 rounded-2xl py-4 items-center"
          style={{ backgroundColor: canSave ? palette.accent : palette.textMuted }}
        >
          <Text className="text-white font-satoshiBold text-[16px]">
            {createStatus === "loading" ? "Creating..." : "Save Meal"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
