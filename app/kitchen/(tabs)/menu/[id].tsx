import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showError, showSuccess } from "@/components/ui/toast";
import {
  makeSelectMealByIdStatus,
  makeSelectMealDeleteStatus,
  makeSelectMealUpdateStatus,
  selectMealById,
} from "@/redux/meals/meals.selectors";
import {
  deleteMealById,
  fetchMealById,
  fetchMeals,
  updateMealById,
} from "@/redux/meals/meals.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function KitchenEditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = String(id || "");
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const meal = useAppSelector(selectMealById(mealId));
  const byIdStatus = useAppSelector(useMemo(() => makeSelectMealByIdStatus(mealId), [mealId]));
  const updateStatus = useAppSelector(
    useMemo(() => makeSelectMealUpdateStatus(mealId), [mealId])
  );
  const deleteStatus = useAppSelector(
    useMemo(() => makeSelectMealDeleteStatus(mealId), [mealId])
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [available, setAvailable] = useState(true);
  const [mealImageUri, setMealImageUri] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mealId && !meal) {
      dispatch(fetchMealById(mealId));
    }
  }, [dispatch, meal, mealId]);

  useEffect(() => {
    if (!meal) return;
    setName(meal.name ?? "");
    setPrice(String(meal.original_price ?? meal.price ?? ""));
    setDesc(meal.description ?? "");
    setAvailable(Boolean(meal.is_available));
    setMealImageUri(meal.cover_image?.url ?? null);
  }, [meal]);

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

  const canSave =
    name.trim().length > 0 &&
    desc.trim().length > 0 &&
    Number(price) > 0 &&
    updateStatus !== "loading";

  const save = async () => {
    if (!meal || !canSave) return;
    try {
      const isRemoteImage = Boolean(mealImageUri && mealImageUri.startsWith("http"));
      const fileName = mealImageUri?.split("/").pop() || "meal.jpg";

      await dispatch(
        updateMealById({
          id: meal.id,
          body: {
            name: name.trim(),
            description: desc.trim(),
            price: Number(price),
            is_available: available,
            cover: !isRemoteImage && mealImageUri
              ? {
                  uri: mealImageUri,
                  name: fileName,
                  type: "image/jpeg",
                }
              : undefined,
          },
        })
      ).unwrap();

      await dispatch(
        fetchMeals({
          page: 1,
          per_page: 200,
          kitchen_id: meal.kitchen_id,
        })
      );

      showSuccess("Meal updated");
      router.back();
    } catch (error: any) {
      showError(error?.message || "Failed to update meal");
    }
  };

  const removeMeal = async () => {
    if (!meal) return;
    try {
      await dispatch(deleteMealById(meal.id)).unwrap();
      await dispatch(
        fetchMeals({
          page: 1,
          per_page: 200,
          kitchen_id: meal.kitchen_id,
        })
      );
      showSuccess("Meal deleted");
      setConfirmDelete(false);
      router.replace("/kitchen/(tabs)/menu");
    } catch (error: any) {
      showError(error?.message || "Failed to delete meal");
    }
  };

  if (!meal && byIdStatus === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

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

        <Pressable
          onPress={() => setConfirmDelete(true)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: isDark ? palette.dangerSoft : "#FFF1F2" }}
        >
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

        <Pressable
          onPress={save}
          disabled={!canSave}
          className="mt-5 rounded-2xl py-4 items-center"
          style={{ backgroundColor: canSave ? palette.accent : palette.textMuted }}
        >
          <Text className="text-white font-satoshiBold text-[16px]">
            {updateStatus === "loading" ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={confirmDelete} transparent animationType="fade">
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: palette.overlay }}>
          <View className="w-full rounded-[26px] p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
            <Text className="text-[18px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              Delete this meal?
            </Text>
            <Text className="text-[14px] mt-2" style={{ color: palette.textSecondary }}>
              This will remove the meal from your kitchen menu.
            </Text>

            <View className="flex-row mt-5">
              <Pressable
                onPress={() => setConfirmDelete(false)}
                className="flex-1 rounded-2xl py-3 items-center mr-2"
                style={{ backgroundColor: palette.surfaceAlt }}
              >
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={removeMeal}
                disabled={deleteStatus === "loading"}
                className="flex-1 rounded-2xl py-3 items-center ml-2"
                style={{ backgroundColor: palette.accent, opacity: deleteStatus === "loading" ? 0.7 : 1 }}
              >
                {deleteStatus === "loading" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-satoshiBold">Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
