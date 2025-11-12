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
import { useAppSelector } from "@/store/hooks";
import {
  selectSearchStatus,
  selectSearchError,
  selectSearchItems,
} from "@/redux/search/search.selectors";
import MealCard from "@/components/home/MealCard";
import SearchBar from "@/components/search/SearchBar";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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
