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
import CachedImageView from "@/components/ui/CachedImage";
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
  const coverUri =
    typeof kitchen?.cover_image?.url === "string" &&
    kitchen.cover_image.url.trim().length > 0
      ? kitchen.cover_image.url
      : null;

  return (
    <View className="flex-1 pt-24">
      <View className="px-4">
        <View
          className={`rounded-[28px] overflow-hidden border ${
            isDark
              ? "bg-neutral-900 border-neutral-800"
              : "bg-white border-neutral-100"
          }`}
        >
          <View className={`h-36 ${isDark ? "bg-neutral-800" : "bg-[#FFF3D6]"}`}>
            <CachedImageView
              uri={coverUri}
              className="w-full h-full"
              fallback={
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="storefront-outline" size={28} color="#F59E0B" />
                </View>
              }
            />
          </View>

          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text
                  className={`font-satoshiBold text-[20px] ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {kitchen?.name || "My Kitchen"}
                </Text>
                <Text
                  numberOfLines={2}
                  className={`mt-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
                >
                  {kitchen?.address || "—"}
                </Text>

                <View className="mt-3 flex-row items-center">
                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      kitchen?.is_available
                        ? "bg-[#E6F7ED]"
                        : isDark
                        ? "bg-neutral-800"
                        : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-satoshiMedium ${
                        kitchen?.is_available ? "text-[#16A34A]" : "text-neutral-500"
                      }`}
                    >
                      {kitchen?.is_available ? "Open" : "Closed"}
                    </Text>
                  </View>
                  <View className="ml-2 flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text
                      className={`ml-1 text-[12px] font-satoshiMedium ${
                        isDark ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {kitchen?.rating ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={onAddMeal}
                className="w-11 h-11 rounded-full bg-primary items-center justify-center"
              >
                <Ionicons name="add" size={22} color="#fff" />
              </Pressable>
            </View>

            <View className="flex-row mt-4">
              <View
                className={`flex-1 mr-2 rounded-2xl p-3 ${
                  isDark ? "bg-neutral-800" : "bg-[#FFF8EB]"
                }`}
              >
                <Text className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                  Meals
                </Text>
                <Text
                  className={`font-satoshiBold text-[18px] ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {meals.length}
                </Text>
              </View>
              <View
                className={`flex-1 mr-2 rounded-2xl p-3 ${
                  isDark ? "bg-neutral-800" : "bg-[#F3F7FF]"
                }`}
              >
                <Text className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                  Delivery
                </Text>
                <Text
                  className={`font-satoshiBold text-[13px] ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {kitchen?.delivery_time || "N/A"}
                </Text>
              </View>
              <View
                className={`flex-1 rounded-2xl p-3 ${
                  isDark ? "bg-neutral-800" : "bg-[#F2FDF8]"
                }`}
              >
                <Text className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                  Prep time
                </Text>
                <Text
                  className={`font-satoshiBold text-[13px] ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {kitchen?.preparation_time || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6 mb-3 flex-row items-center justify-between">
          <Text
            className={`text-[16px] font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Your meals
          </Text>
          <Pressable
            onPress={onAddMeal}
            className={`px-3 py-2 rounded-full ${
              isDark ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <Text
              className={`text-[12px] font-satoshiMedium ${
                isDark ? "text-neutral-200" : "text-neutral-800"
              }`}
            >
              Add meal
            </Text>
          </Pressable>
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
        <View className="items-center mt-10 px-6">
          <Image
            source={require("@/assets/images/empty-box.png")}
            className="w-24 h-24"
          />
          <Text
            className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            No meals yet
          </Text>
          <Text
            className={`mt-1 text-center ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            Pull to refresh or tap Add meal to create your first menu item
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
