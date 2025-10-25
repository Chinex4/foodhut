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

  return (
    <View className="flex-1 bg-primary-50 pt-6">
      {/* Always visible */}
      <View className="mt-6 px-5 mb-4">
        <SearchBar className="mt-4" />
      </View>

      <FlatList
        data={meals}
        keyExtractor={(m: any) => String(m.id)}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          flexGrow: 1, // so ListEmptyComponent centers nicely
        }}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        windowSize={7}
        initialNumToRender={6}
        renderItem={({ item }: any) => (
          <View className="mb-4">
            <MealCard
              item={item}
              onPress={() => router.push(`/users/meal/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            {status === "loading" ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#ffa800" />
            ) : status === "failed" ? (
              <Text className="text-center text-red-600 mt-6">{error}</Text>
            ) : (
              <View className="items-center">
                <Image source={require("@/assets/images/trayy.png")} />
                <Text className="text-neutral-500 mt-4">
                  Search for meals or kitchen.
                </Text>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
}
