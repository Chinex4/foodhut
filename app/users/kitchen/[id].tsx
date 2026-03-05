import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import MealCard from "@/components/home/MealCard";
import FloatingCartButton from "@/components/cart/FloatingCartButton";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  makeSelectByIdStatus,
  selectKitchenById,
} from "@/redux/kitchen/kitchen.selectors";
import { fetchKitchenById } from "@/redux/kitchen/kitchen.thunks";
import { fetchMeals } from "@/redux/meals/meals.thunks";
import { selectMealsList, selectMealsListStatus } from "@/redux/meals/meals.selectors";

export default function KitchenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const kitchenId = id ?? "";

  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const kitchen = useAppSelector(selectKitchenById(kitchenId));
  const kitchenStatus = useAppSelector(makeSelectByIdStatus(kitchenId));
  const meals = useAppSelector(selectMealsList);
  const mealsStatus = useAppSelector(selectMealsListStatus);

  useEffect(() => {
    if (!kitchenId) return;
    if (!kitchen) {
      dispatch(fetchKitchenById(kitchenId));
    }

    dispatch(
      fetchMeals({
        page: 1,
        per_page: 200,
        kitchen_id: kitchenId,
      })
    );
  }, [dispatch, kitchenId, kitchen]);

  const coverUrl = useMemo(() => {
    const value = kitchen?.cover_image?.url;
    return typeof value === "string" && value.trim().length > 0 ? value : null;
  }, [kitchen]);

  if ((kitchenStatus === "loading" || !kitchen) && !kitchen) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <ActivityIndicator color="#ffa800" size="large" />
      </View>
    );
  }

  if (!kitchen) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <Text className={`text-[16px] font-satoshiBold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Kitchen not found
        </Text>
        <Pressable onPress={() => router.back()} className="px-5 py-3 rounded-2xl bg-primary">
          <Text className="text-white font-satoshiMedium">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="relative h-72 bg-secondary">
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="storefront-outline" size={40} color="#F59E0B" />
          </View>
        )}

        <View className="absolute top-20 left-4 right-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push("/users/kitchen")}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-4 pt-4">
          <Text className={`text-[22px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {kitchen.name}
          </Text>
          <Text className={`mt-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            {kitchen.type} • {kitchen.city?.name ?? "Unknown city"}
          </Text>

          <View className="mt-3 flex-row items-center">
            <View className={`px-2.5 py-1 rounded-full ${kitchen.is_available ? "bg-[#E6F7ED]" : "bg-neutral-200"}`}>
              <Text className={`text-[11px] font-satoshiMedium ${kitchen.is_available ? "text-[#16A34A]" : "text-neutral-500"}`}>
                {kitchen.is_available ? "Open" : "Closed"}
              </Text>
            </View>
            <View className="ml-2 flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className={`ml-1 text-[12px] font-satoshiMedium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                {String(kitchen.rating ?? "0")}
              </Text>
            </View>
            <Text className={`ml-3 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {kitchen.delivery_time || kitchen.preparation_time || "N/A"}
            </Text>
          </View>

          <Text className={`mt-4 text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Meals
          </Text>
        </View>

        {mealsStatus === "loading" && meals.length === 0 ? (
          <View className="items-center mt-10">
            <ActivityIndicator color="#ffa800" />
          </View>
        ) : (
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <MealCard
                item={item}
                onPress={() => router.push(`/users/meal/${item.id}` as any)}
              />
            )}
            ListEmptyComponent={
              <View className="items-center mt-8">
                <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                  No meals available yet.
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>

      <FloatingCartButton onPress={() => router.push("/users/(tabs)/orders")} />
    </View>
  );
}
