import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import MealCard from "@/components/home/MealCard";
import MealCardSkeleton from "@/components/home/MealCardSkeleton";
import CachedImage from "@/components/ui/CachedImage";
import type { Kitchen } from "@/redux/kitchen/kitchen.types";
import type { Meal } from "@/redux/meals/meals.types";

type Props = {
  kitchen: Kitchen | null;
  meals: Meal[];
  isDark: boolean;
  mealsLoading: boolean;
  onAddMeal: () => void;
  onRefresh: () => void;
  refreshing: boolean;
};

export default function HomeTab({
  kitchen,
  meals,
  isDark,
  mealsLoading,
  onAddMeal,
  onRefresh,
  refreshing,
}: Props) {
  return (
    <View className="flex-1 pt-24">
      <View
        className={`rounded-3xl p-4 mb-4 border ${
          isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-100"
        }`}
      >
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-200">
            {kitchen?.cover_image?.url ? (
              <Image
                source={{ uri: kitchen?.cover_image?.url }}
                className="w-full h-full"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="storefront-outline" size={22} color="#F59E0B" />
              </View>
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text
              className={`font-satoshiBold text-[17px] ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              {kitchen?.name || "My Kitchen"}
            </Text>
            <Text className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              {kitchen?.address || "—"}
            </Text>
          </View>
        </View>
        <View className="flex-row mt-4">
          <View className="flex-1">
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              Meals
            </Text>
            <Text
              className={`font-satoshiBold text-lg ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              {meals.length}
            </Text>
          </View>
          <View className="flex-1">
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              Rating
            </Text>
            <Text
              className={`font-satoshiBold text-lg ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              {kitchen?.rating ?? "—"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              Status
            </Text>
            <Text
              className={`font-satoshiBold text-lg ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              {kitchen?.is_available ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
      </View>

      {mealsLoading ? (
        <MealCardSkeleton />
      ) : meals.length ? (
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingBottom: 160 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F59E0B"
            />
          }
          renderItem={({ item }) => (
            <View className="mb-3">
              <MealCard item={item} />
            </View>
          )}
        />
      ) : (
        <View className="items-center mt-10">
          <Image
            source={require("@/assets/images/empty-box.png")}
            className="w-24 h-24"
          />
          <Text
            className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            No meals yet
          </Text>
          <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
            Pull to refresh or tap the + button to add your first meal
          </Text>
        </View>
      )}

      <Pressable
        onPress={onAddMeal}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}
