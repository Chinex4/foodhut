import MealCard from "@/components/home/MealCard";
import { getKitchenInitials } from "@/components/home/KitchenCard";
import SearchBar from "@/components/search/SearchBar";
import {
  selectSearchError,
  selectSearchKitchens,
  selectSearchMeals,
  selectSearchStatus,
} from "@/redux/search/search.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import FloatingCartButton from "@/components/cart/FloatingCartButton";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import type { SearchItem } from "@/redux/search/search.types";

type SearchResult = SearchItem & { uniqueKey: string };

export default function SearchResultsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const status = useAppSelector(selectSearchStatus);
  const error = useAppSelector(selectSearchError);
  const meals = useAppSelector(selectSearchMeals);
  const kitchens = useAppSelector(selectSearchKitchens);
  const results = useMemo<SearchResult[]>(() => {
    const seen = new Set<string>();
    return [...kitchens, ...meals]
      .map((item, index) => ({ ...item, uniqueKey: `${item.kind}:${item.id}:${index}` }))
      .filter((item) => {
        const key = `${item.kind}:${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [kitchens, meals]);

  const kitchenMap = useMemo(() => {
    const map = new Map<string, { name: string; rating?: string | number | null }>();
    kitchens.forEach((k: any) => {
      map.set(String(k.id), { name: k.name, rating: k.rating });
    });
    return map;
  }, [kitchens]);

  const sectionTitleClass = `text-[16px] font-satoshiBold ${
    isDark ? "text-neutral-200" : "text-neutral-900"
  }`;

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"} pt-16`}>
      {/* Always visible */}
      <View className="mt-6 px-5 mb-4">
        <SearchBar className="mt-4" />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item: SearchResult) => item.uniqueKey}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          flexGrow: 1, // so ListEmptyComponent centers nicely
        }}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        windowSize={7}
        initialNumToRender={6}
        ListHeaderComponent={
          results.length ? (
            <View className="mb-3">
              <Text className={sectionTitleClass}>Results</Text>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: SearchResult }) => {
          if (item.kind === "kitchen") {
            const coverUrl = item.cover_image?.url;
            return (
              <View style={{ width: "48%" }}>
                <Pressable
                  onPress={() => router.push(`/users/kitchen/${item.id}`)}
                  className={`rounded-2xl border overflow-hidden ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                >
                  <View className={`h-32 items-center justify-center ${isDark ? "bg-neutral-800" : "bg-secondary"}`}>
                    {coverUrl ? (
                      <Image source={{ uri: coverUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className={`text-[28px] font-satoshiBold ${isDark ? "text-primary" : "text-neutral-900"}`}>
                        {getKitchenInitials(item.name) || "FH"}
                      </Text>
                    )}
                  </View>
                  <View className="p-3">
                    <Text numberOfLines={1} className={`font-satoshiBold text-[14px] ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} className={`mt-1 font-satoshi text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {item.type || "Cuisine"}
                    </Text>
                    <Text numberOfLines={1} className={`mt-1 font-satoshi text-[11px] ${item.is_available ? "text-green-600" : isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                      {item.is_available ? "Open" : "Closed"}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          }

          return (
            <View style={{ width: "48%" }}>
              <MealCard
                item={item}
                onPress={() => router.push(`/users/meal/${item.id}`)}
                kitchenName={kitchenMap.get(String(item.kitchen_id))?.name}
                kitchenRating={kitchenMap.get(String(item.kitchen_id))?.rating}
                compact
                grid
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            {status === "loading" ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#ffa800" />
            ) : status === "failed" ? (
              <Text className="text-center text-red-600 mt-6">{error}</Text>
            ) : results.length === 0 ? (
              <View className="items-center">
                <Image source={require("@/assets/images/trayy.png")} />
                <Text className={`mt-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Search for meals or kitchens.
                </Text>
              </View>
            ) : null}
          </View>
        }
      />

      <FloatingCartButton onPress={() => router.push("/users/(tabs)/orders")} />
    </View>
  );
}
