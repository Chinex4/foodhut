import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

import HomeTab from "@/app/kitchen/components/HomeTab";
import AddMealModal from "@/app/kitchen/components/AddMealModal";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { useAppDispatch } from "@/store/hooks";
import { createMeal, fetchMeals } from "@/redux/meals/meals.thunks";
import { showError, showSuccess } from "@/components/ui/toast";

export default function KitchenHomeScreen() {
  const dispatch = useAppDispatch();
  const { isDark, kitchen, kitchenStatus, meals, mealsStatus, refreshMeals } =
    useKitchenData();

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [newMealDesc, setNewMealDesc] = useState("");
  const [newMealPrice, setNewMealPrice] = useState("");
  const [newMealImage, setNewMealImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [savingMeal, setSavingMeal] = useState(false);
  const [refreshingMeals, setRefreshingMeals] = useState(false);

  const pickMealImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled) {
        setNewMealImage(res.assets[0]);
      }
    } catch (err: any) {
      showError(err?.message || "Unable to pick image");
    }
  };

  const handleCreateMeal = async () => {
    if (!newMealName.trim() || !newMealPrice.trim()) {
      return showError("Name and price are required");
    }
    setSavingMeal(true);
    try {
      await dispatch(
        createMeal({
          name: newMealName.trim(),
          description: newMealDesc.trim(),
          price: newMealPrice.trim(),
          cover: newMealImage
            ? {
                uri: newMealImage.uri,
                name: newMealImage.fileName ?? "meal.jpg",
                type: newMealImage.type ?? "image/jpeg",
              }
            : undefined,
        })
      ).unwrap();
      setShowAddMeal(false);
      setNewMealName("");
      setNewMealDesc("");
      setNewMealPrice("");
      setNewMealImage(null);
      dispatch(fetchMeals({ page: 1, per_page: 200 }));
      showSuccess("Meal created");
    } catch (err: any) {
      showError(err?.message || "Failed to create meal");
    } finally {
      setSavingMeal(false);
    }
  };

  const handleRefreshMeals = async () => {
    setRefreshingMeals(true);
    await refreshMeals();
    setRefreshingMeals(false);
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color="#F59E0B" />
      </View>
    );
  }

  return (
    <View className={`flex-1 pt-20 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <HomeTab
        kitchen={kitchen}
        meals={meals.filter((m) => m.kitchen_id === kitchen?.id)}
        isDark={isDark}
        mealsLoading={mealsStatus === "loading"}
        onAddMeal={() => setShowAddMeal(true)}
        onRefresh={handleRefreshMeals}
        refreshing={refreshingMeals}
      />

      <AddMealModal
        visible={showAddMeal}
        isDark={isDark}
        name={newMealName}
        desc={newMealDesc}
        price={newMealPrice}
        image={newMealImage}
        onChangeName={setNewMealName}
        onChangeDesc={setNewMealDesc}
        onChangePrice={setNewMealPrice}
        onPickImage={pickMealImage}
        onClose={() => setShowAddMeal(false)}
        onSave={handleCreateMeal}
        saving={savingMeal}
      />
    </View>
  );
}
