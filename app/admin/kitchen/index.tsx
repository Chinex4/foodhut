import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showError, showSuccess } from "@/components/ui/toast";
import {
    selectKitchenProfile,
    selectKitchenProfileStatus,
} from "@/redux/kitchen/kitchen.selectors";
import {
    fetchKitchenProfile,
} from "@/redux/kitchen/kitchen.thunks";
import {
    selectMealsEntities,
    selectMealsIds,
    selectMealsListStatus,
} from "@/redux/meals/meals.selectors";
import { createMeal, fetchMeals } from "@/redux/meals/meals.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import CachedImageView from "@/components/ui/CachedImage";

export default function KitchenDashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const kitchen = useAppSelector(selectKitchenProfile);
  const kitchenStatus = useAppSelector(selectKitchenProfileStatus);
  const mealIds = useAppSelector(selectMealsIds);
  const meals = useAppSelector(selectMealsEntities);
  const mealsStatus = useAppSelector(selectMealsListStatus);

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [mealPrice, setMealPrice] = useState("");
  const [mealImage, setMealImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);

  // Fetch kitchen and meals on mount
  useEffect(() => {
    if (kitchenStatus === "idle") {
      dispatch(fetchKitchenProfile());
    }
  }, [kitchenStatus, dispatch]);

  useEffect(() => {
    if (kitchen?.id && mealsStatus === "idle") {
      dispatch(fetchMeals({ page: 1, per_page: 50 }));
    }
  }, [kitchen?.id, mealsStatus, dispatch]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = asset.uri.split("/").pop() || "meal.jpg";
        setMealImage({
          uri: asset.uri,
          name: fileName,
          type: asset.type || "image/jpeg",
        });
      }
    } catch {
      showError("Failed to pick image");
    }
  };

  const handleCreateMeal = async () => {
    if (!mealName.trim() || !mealPrice.trim() || !mealImage) {
      return showError("Please fill all required fields");
    }

    try {
      setCreating(true);
      await dispatch(
        createMeal({
          name: mealName.trim(),
          description: mealDescription.trim(),
          price: parseFloat(mealPrice),
          cover: mealImage,
        })
      ).unwrap();

      showSuccess("Meal added successfully!");
      setShowAddMealModal(false);
      setMealName("");
      setMealDescription("");
      setMealPrice("");
      setMealImage(null);

      // Refetch meals
      dispatch(fetchMeals({ page: 1, per_page: 50 }));
    } catch (err: any) {
      showError(err?.message || "Failed to create meal");
    } finally {
      setCreating(false);
    }
  };

  if (kitchenStatus === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FFA800" size={32} />
      </View>
    );
  }

  if (!kitchen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-neutral-700 font-satoshiMedium">
          No kitchen found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-full px-6 py-2"
        >
          <Text className="text-white font-satoshiBold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const mealList = mealIds.map((id: string) => (meals as any)[id]).filter(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#0F172A" />
        </Pressable>
        <Text className="font-satoshiBold text-[18px] text-neutral-900">
          Kitchen Dashboard
        </Text>
        <View className="w-7" />
      </View>

      {/* Kitchen Info Banner */}
      <View className="mx-5 mt-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-5 border border-primary-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-satoshiBold text-[18px] text-neutral-900">
              {kitchen.name}
            </Text>
            <Text className="text-neutral-600 font-satoshi text-[13px] mt-2">
              {kitchen.address}
            </Text>
            <View className="flex-row items-center mt-3 gap-4">
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FFA800" />
                <Text className="ml-1 font-satoshiBold text-neutral-900">
                  {kitchen.rating}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text className="ml-1 font-satoshiBold text-neutral-900">
                  {kitchen.likes}
                </Text>
              </View>
            </View>
          </View>
          {kitchen.cover_image && (
            <CachedImageView
              uri={kitchen.cover_image}
              className="w-20 h-20 rounded-2xl"
            />
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 mx-5 mt-5">
        <View className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
              <Ionicons name="restaurant-outline" size={20} color="#FFA800" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[12px] text-neutral-500 font-satoshi">
                Meals
              </Text>
              <Text className="text-[18px] font-satoshiBold text-neutral-900">
                {mealList.length}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
              <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[12px] text-neutral-500 font-satoshi">
                Available
              </Text>
              <Text className="text-[18px] font-satoshiBold text-neutral-900">
                {kitchen.is_available ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Meals List */}
      <View className="flex-1 mt-6">
        <View className="flex-row items-center justify-between px-5 mb-4">
          <Text className="font-satoshiBold text-[16px] text-neutral-900">
            Meals ({mealList.length})
          </Text>
          <Pressable
            onPress={() => setShowAddMealModal(true)}
            className="bg-primary rounded-full p-2"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {mealsStatus === "loading" ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#FFA800" size={32} />
          </View>
        ) : mealList.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-neutral-500 font-satoshi">
              No meals yet
            </Text>
            <Text className="text-neutral-400 text-[13px] mt-2 px-8 text-center font-satoshi">
              Add your first meal to start selling
            </Text>
          </View>
        ) : (
          <FlatList
            data={mealList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl border border-neutral-100 mb-4 overflow-hidden flex-row">
                {item.cover_image && (
                  <CachedImageView
                    uri={item.cover_image.url}
                    className="w-24 h-24 bg-neutral-200"
                  />
                )}
                <View className="flex-1 p-3 justify-center">
                  <Text
                    numberOfLines={1}
                    className="font-satoshiBold text-neutral-900"
                  >
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-[12px] text-neutral-600 mt-1"
                  >
                    {item.description}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="font-satoshiBold text-primary text-[16px]">
                      {formatNGN(Number(item.price))}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        item.is_available
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-satoshiBold ${
                          item.is_available
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        onRequestClose={() => !creating && setShowAddMealModal(false)}
        transparent
        animationType="slide"
      >
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar style="dark" />

          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
            <Pressable
              onPress={() => setShowAddMealModal(false)}
              disabled={creating}
            >
              <Ionicons name="chevron-back" size={28} color="#0F172A" />
            </Pressable>
            <Text className="font-satoshiBold text-[18px] text-neutral-900">
              Add Meal
            </Text>
            <View className="w-7" />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Meal Image */}
              <Pressable
                onPress={handlePickImage}
                disabled={creating}
                className="bg-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden mb-4 h-40 items-center justify-center"
              >
                {mealImage ? (
                  <CachedImageView
                    uri={mealImage.uri}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                    <Text className="mt-2 text-neutral-600 font-satoshi">
                      Tap to select image
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Meal Name */}
              <View className="mb-4">
                <Text className="text-neutral-700 font-satoshiMedium mb-2">
                  Meal Name *
                </Text>
                <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
                  <Ionicons name="restaurant-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder="e.g. Jollof Rice"
                    placeholderTextColor="#D1D5DB"
                    editable={!creating}
                    className="flex-1 ml-3 font-satoshi text-neutral-900"
                  />
                </View>
              </View>

              {/* Meal Description */}
              <View className="mb-4">
                <Text className="text-neutral-700 font-satoshiMedium mb-2">
                  Description
                </Text>
                <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3">
                  <TextInput
                    value={mealDescription}
                    onChangeText={setMealDescription}
                    placeholder="Describe your meal"
                    placeholderTextColor="#D1D5DB"
                    multiline
                    numberOfLines={3}
                    editable={!creating}
                    className="font-satoshi text-neutral-900"
                  />
                </View>
              </View>

              {/* Meal Price */}
              <View className="mb-4">
                <Text className="text-neutral-700 font-satoshiMedium mb-2">
                  Price (₦) *
                </Text>
                <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
                  <Text className="text-neutral-600 font-satoshiBold">₦</Text>
                  <TextInput
                    value={mealPrice}
                    onChangeText={setMealPrice}
                    placeholder="e.g. 2500"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="decimal-pad"
                    editable={!creating}
                    className="flex-1 ml-2 font-satoshi text-neutral-900"
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Bottom Button */}
          <View className="absolute left-0 right-0 bottom-0 px-5 pb-6 pt-4 bg-[#FFFDF8] border-t border-neutral-100">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowAddMealModal(false)}
                disabled={creating}
                className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center"
              >
                <Text className="text-neutral-700 font-satoshiBold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateMeal}
                disabled={creating || !mealName.trim() || !mealPrice.trim() || !mealImage}
                className={`flex-1 rounded-2xl py-4 items-center ${
                  creating || !mealName.trim() || !mealPrice.trim() || !mealImage
                    ? "bg-neutral-300"
                    : "bg-primary"
                }`}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-satoshiBold">
                    Add Meal
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
