import AdsCarousel from "@/components/home/AdsCarousel";
import KitchenVendorsSection from "@/components/home/KitchenVendorSection";
import LocationPickerModal from "@/components/home/LocationPickerModal";
import MealCard from "@/components/home/MealCard";
import MealCardSkeleton from "@/components/home/MealCardSkeleton";
import Section from "@/components/home/Section";
import SearchBar from "@/components/search/SearchBar";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import {
  makeSelectMostPopular,
  makeSelectTrendingDiscounts,
  makeSelectVendorsCloseBy,
  selectMealsError,
  selectMealsListStatus,
} from "@/redux/meals/meals.selectors";
import { fetchMeals } from "@/redux/meals/meals.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectFetchMeStatus, selectMe } from "@/redux/users/users.selectors";
import { fetchMyProfile } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const status = useAppSelector(selectMealsListStatus);
  const fetchMestatus = useAppSelector(selectFetchMeStatus);
  const error = useAppSelector(selectMealsError);
  const { selectedCity, updateCity } = useSelectedCity();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const trendingSel = useMemo(() => makeSelectTrendingDiscounts(10), []);
  const popularSel = useMemo(() => makeSelectMostPopular(10), []);
  const vendorsSel = useMemo(() => makeSelectVendorsCloseBy(10), []);

  const trending = useAppSelector(trendingSel);
  const popular = useAppSelector(popularSel);
  const vendors = useAppSelector(vendorsSel);
  const me = useAppSelector(selectMe);
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMeals({ page: 1, per_page: 50 }));
    }
  }, [status, dispatch]);
  useEffect(() => {
    if (fetchMestatus === "idle") {
      dispatch(fetchMyProfile());
    }
  }, [fetchMestatus, dispatch]);

  const handleCitySelect = (city: KitchenCity) => {
    updateCity(city);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          // paddingTop: Platform.select({ android: 40, ios: 60 }),
        }}
      >
        {/* top greeting + location */}
        <View className="px-4 pt-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text
                className={`font-satoshiMedium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
              >
                Welcome, {me?.first_name}
              </Text>
              <Text
                className={`text-[32px] font-satoshiBold mt-1 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                Eat Your Fav!
              </Text>
            </View>

            {/* Location Icon Button */}
            <Pressable
              onPress={() => setLocationModalVisible(true)}
              className={`ml-4 w-14 h-14 rounded-full ${isDark ? "bg-neutral-800" : "bg-white"} bg-white items-center justify-center shadow-md ${isDark ? "active:bg-neutral-800" : "active:bg-neutral-50"}`}
              style={Platform.select({ android: { elevation: 3 } })}
            >
              <View>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={28}
                  color="#ffa800"
                />
                {selectedCity && (
                  <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                    <MaterialCommunityIcons
                      name="check"
                      size={10}
                      color="white"
                    />
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* Display selected city */}
          {selectedCity && (
            <View
              className={`flex-row items-center rounded-full px-4 py-2 mb-4 shadow-sm ${isDark ? "bg-neutral-800 border border-neutral-700" : "bg-white border-0"}`}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#ffa800"
              />
              <Text
                className={`ml-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-700"}`}
              >
                {selectedCity.name}
              </Text>
              <Pressable
                onPress={() => setLocationModalVisible(true)}
                className="ml-auto"
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={14}
                  color={isDark ? "#6B7280" : "#9CA3AF"}
                />
              </Pressable>
            </View>
          )}

          {/* search */}
          <SearchBar className="mt-4" />
        </View>

        {/* promo banner (static placeholder) */}
        <AdsCarousel />

        {/* sections */}
        <Section
          title="Trending Discounts"
          onSeeAll={() => router.push("/users/category/trending")}
          data={status === "loading" ? Array.from({ length: 4 }) : trending}
          horizontal
          renderItem={({ item }: any) =>
            status === "loading" ? (
              <MealCardSkeleton compact />
            ) : (
              <MealCard
                onPress={() => router.push(`/users/meal/${item.id}` as any)}
                item={item}
                compact
              />
            )
          }
        />

        <Section
          title="Most Popular Order"
          onSeeAll={() => router.push("/users/category/popular")}
          data={status === "loading" ? Array.from({ length: 4 }) : popular}
          horizontal
          renderItem={({ item }: any) =>
            status === "loading" ? (
              <MealCardSkeleton compact />
            ) : (
              <MealCard
                item={item}
                onPress={() => router.push(`/users/meal/${item.id}` as any)}
                compact
              />
            )
          }
        />

        <KitchenVendorsSection />

        {/* <Pressable className=" bg-primary mt-10 mx-4 rounded-lg py-6 px-4" onPress={() => router.push('/(auth)/choose-role')}>
          <Text className="text-center text-white mt-6 mb-12">Move to choose role</Text>
        </Pressable> */}

        {status === "failed" && !!error && (
          <Text className="px-4 mt-6 text-red-600">{error}</Text>
        )}
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
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
    </SafeAreaView>
  );
}
