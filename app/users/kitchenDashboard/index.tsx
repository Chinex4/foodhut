import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectKitchenProfile,
  selectKitchenProfileStatus,
} from "@/redux/kitchen/kitchen.selectors";
import {
  fetchKitchenProfile,
  updateKitchenByProfile,
  uploadKitchenCoverByProfile,
} from "@/redux/kitchen/kitchen.thunks";
import {
  selectMealsArray,
  selectMealsListStatus,
} from "@/redux/meals/meals.selectors";
import { createMeal, fetchMeals } from "@/redux/meals/meals.thunks";
import {
  selectOrdersList,
  selectOrdersListStatus,
  selectOrdersState,
} from "@/redux/orders/orders.selectors";
import { fetchOrders, updateOrderItemStatus } from "@/redux/orders/orders.thunks";

import HomeTab from "./components/HomeTab";
import OrdersTab from "./components/OrdersTab";
import SettingsTab from "./components/SettingsTab";
import AddMealModal from "./components/AddMealModal";
import { showError, showSuccess } from "@/components/ui/toast";

type TabKey = "HOME" | "ORDERS" | "SETTINGS";

export default function KitchenDashboard() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const kitchen = useAppSelector(selectKitchenProfile);
  const kitchenStatus = useAppSelector(selectKitchenProfileStatus);
  const mealsStatus = useAppSelector(selectMealsListStatus);
  const ordersStatus = useAppSelector(selectOrdersListStatus);
  const meals = useAppSelector(selectMealsArray);
  const orders = useAppSelector(selectOrdersList);
  const ordersState = useAppSelector(selectOrdersState);

  const [tab, setTab] = useState<TabKey>("HOME");
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [newMealDesc, setNewMealDesc] = useState("");
  const [newMealPrice, setNewMealPrice] = useState("");
  const [newMealImage, setNewMealImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [savingMeal, setSavingMeal] = useState(false);

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [kitchenName, setKitchenName] = useState("");
  const [kitchenPhone, setKitchenPhone] = useState("");
  const [kitchenAddress, setKitchenAddress] = useState("");

  const [refreshingMeals, setRefreshingMeals] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);

  const mealsForKitchen = useMemo(
    () => meals.filter((m) => m.kitchen_id === kitchen?.id),
    [meals, kitchen?.id]
  );

  useEffect(() => {
    if (!kitchen) {
      dispatch(fetchKitchenProfile());
    }
  }, [dispatch, kitchen]);

  useEffect(() => {
    if (kitchen && mealsStatus === "idle") {
      dispatch(fetchMeals({ page: 1, per_page: 200 }));
    }
  }, [dispatch, kitchen, mealsStatus]);

  useEffect(() => {
    if (kitchen?.id) {
      dispatch(fetchOrders({ kitchen_id: kitchen.id, per_page: 50 }));
    }
  }, [dispatch, kitchen?.id]);

  useEffect(() => {
    if (kitchen) {
      setKitchenName(kitchen.name || "");
      setKitchenPhone(kitchen.phone_number || "");
      setKitchenAddress(kitchen.address || "");
    }
  }, [kitchen]);

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

  const handleUpdateCover = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      await dispatch(
        uploadKitchenCoverByProfile({
          uri: asset.uri,
          name: asset.fileName ?? "cover.jpg",
          type: asset.type ?? "image/jpeg",
        })
      ).unwrap();
      showSuccess("Cover updated");
    } catch (err: any) {
      showError(err?.message || "Failed to upload cover");
    }
  };

  const handleSaveSettings = async () => {
    if (!kitchen) return;
    setSettingsSaving(true);
    try {
      await dispatch(
        updateKitchenByProfile({
          name: kitchenName.trim(),
          phone_number: kitchenPhone.trim(),
          address: kitchenAddress.trim(),
        })
      ).unwrap();
      showSuccess("Kitchen updated");
      dispatch(fetchKitchenProfile());
    } catch (err: any) {
      showError(err?.message || "Failed to update kitchen");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleRefreshMeals = async () => {
    setRefreshingMeals(true);
    await dispatch(fetchMeals({ page: 1, per_page: 200 }));
    setRefreshingMeals(false);
  };

  const handleRefreshOrders = async () => {
    if (!kitchen?.id) return;
    setRefreshingOrders(true);
    await dispatch(fetchOrders({ kitchen_id: kitchen.id, per_page: 50 }));
    setRefreshingOrders(false);
  };

  const handleAdvanceOrder = async (
    orderId: string,
    itemId: string,
    nextStatus: string,
    asKitchen: boolean
  ) => {
    try {
      await dispatch(
        updateOrderItemStatus({
          orderId,
          itemId,
          status: nextStatus as any,
          as_kitchen: asKitchen,
        })
      ).unwrap();
      showSuccess("Order updated");
    } catch (err: any) {
      showError(err?.message || "Failed to update order");
    }
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <ActivityIndicator color="#F59E0B" />
      </View>
    );
  }

  const updatingMap = useMemo(() => {
    const raw = ordersState.updateItemStatus || {};
    return Object.keys(raw).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = raw[key] === "loading";
      return acc;
    }, {});
  }, [ordersState.updateItemStatus]);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      router.push("/users/(tabs)");
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-16 pb-4 flex-row items-center justify-between">
        <Pressable onPress={handleBack} className="flex-row items-center">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
          <Text className={`ml-1 font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/users/(tabs)")}
          className={`px-3 py-2 rounded-full border ${
            isDark ? "border-neutral-700 bg-neutral-900" : "border-neutral-200 bg-white"
          }`}
        >
          <Text className={isDark ? "text-neutral-100" : "text-neutral-900"}>
            User Dashboard
          </Text>
        </Pressable>
      </View>

      <View className="px-5">
        <View
          className={`flex-row rounded-full p-1 mb-4 ${
            isDark ? "bg-neutral-900 border border-neutral-800" : "bg-white border border-neutral-100"
          }`}
        >
          {(["HOME", "ORDERS", "SETTINGS"] as TabKey[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-full items-center ${
                tab === t ? "bg-primary" : ""
              }`}
            >
              <Text
                className={`font-satoshiMedium ${
                  tab === t
                    ? "text-white"
                    : isDark
                      ? "text-neutral-300"
                      : "text-neutral-700"
                }`}
              >
                {t === "HOME" ? "Home" : t === "ORDERS" ? "Orders" : "Settings"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-1 px-5 pb-6">
        {tab === "HOME" && (
          <HomeTab
            kitchen={kitchen}
            meals={mealsForKitchen}
            isDark={isDark}
            mealsLoading={mealsStatus === "loading"}
            onAddMeal={() => setShowAddMeal(true)}
            onRefresh={handleRefreshMeals}
            refreshing={refreshingMeals}
          />
        )}
        {tab === "ORDERS" && (
          <OrdersTab
            orders={orders}
            kitchenId={kitchen?.id}
            isDark={isDark}
            refreshing={refreshingOrders}
            onRefresh={handleRefreshOrders}
            onAdvance={handleAdvanceOrder}
            updatingMap={updatingMap}
            loading={ordersStatus === "loading"}
          />
        )}
        {tab === "SETTINGS" && (
          <SettingsTab
            kitchen={kitchen}
            isDark={isDark}
            kitchenName={kitchenName}
            kitchenPhone={kitchenPhone}
            kitchenAddress={kitchenAddress}
            onChangeName={setKitchenName}
            onChangePhone={setKitchenPhone}
            onChangeAddress={setKitchenAddress}
            onUpdateCover={handleUpdateCover}
            onSave={handleSaveSettings}
            saving={settingsSaving}
          />
        )}
      </View>

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
