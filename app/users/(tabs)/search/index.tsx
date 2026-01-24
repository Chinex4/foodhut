import MealCard from "@/components/home/MealCard";
import KitchenCard from "@/components/home/KitchenCard";
import SearchBar from "@/components/search/SearchBar";
import {
  selectSearchError,
  selectSearchKitchens,
  selectSearchMeals,
  selectSearchStatus,
} from "@/redux/search/search.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

export default function SearchResultsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const status = useAppSelector(selectSearchStatus);
  const error = useAppSelector(selectSearchError);
  const meals = useAppSelector(selectSearchMeals);
  const kitchens = useAppSelector(selectSearchKitchens);

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
        ListHeaderComponent={
          kitchens.length ? (
            <View className="mb-6">
              <Text className={sectionTitleClass}>Kitchens</Text>
              <FlatList
                data={kitchens}
                keyExtractor={(k: any) => String(k.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 4, paddingRight: 16 }}
                renderItem={({ item }: any) => <KitchenCard kitchen={item} />}
              />
              {meals.length ? (
                <Text className={`${sectionTitleClass} mt-2`}>Meals</Text>
              ) : null}
            </View>
          ) : meals.length ? (
            <View className="mb-3">
              <Text className={sectionTitleClass}>Meals</Text>
            </View>
          ) : null
        }
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
            ) : meals.length === 0 && kitchens.length === 0 ? (
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

      <View className="absolute bottom-6 right-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open orders"
          onPress={() => router.push("/users/(tabs)/orders")}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
          className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-lg"
          style={Platform.select({ android: { elevation: 8 } })}
        >
          <Ionicons name="cart" size={30} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
