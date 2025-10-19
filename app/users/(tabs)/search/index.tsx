import React from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import {
  selectSearchStatus,
  selectSearchError,
  selectSearchItems,
} from "@/redux/search/search.selectors";
import MealCard from "@/components/home/MealCard";
import SearchBar from "@/components/search/SearchBar";
import { router } from "expo-router";

export default function SearchResultsScreen() {
  const status = useAppSelector(selectSearchStatus);
  const error = useAppSelector(selectSearchError);
  const items = useAppSelector(selectSearchItems);

  const meals = items.filter((x) => x.kind === "meal");

  if (status === "loading") {
    return (
      <View className="flex-1 bg-white pt-8">
        <ActivityIndicator style={{ marginTop: 80 }} color="#ffa800" />
      </View>
    );
  }
  if (status === "failed") {
    return (
      <View className="flex-1 bg-white pt-8">
        <Text className="text-center text-red-600 mt-6">{error}</Text>
      </View>
    );
  }
  if (!meals.length) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Image source={require('@/assets/images/trayy.png')}/>
        <Text className="text-neutral-500 mt-4">Search for meals or kitchen.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary-50 pt-6">
      <View className="mt-20 px-5 mb-4">
        <SearchBar className="mt-4" />
      </View>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        renderItem={({ item }: any) => (
          <View className="mb-4">
            <MealCard item={item} onPress={
              () => router.push(`/users/meal/${item.id}`)
            } />
          </View>
        )}
      />
    </View>
  );
}
