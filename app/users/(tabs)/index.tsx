// app/(tabs)/index.tsx
import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeals } from "@/redux/meals/meals.thunks";
import {
  selectMealsListStatus,
  selectMealsError,
  makeSelectTrendingDiscounts,
  makeSelectMostPopular,
  makeSelectVendorsCloseBy,
} from "@/redux/meals/meals.selectors";
import MealCard from "@/components/home/MealCard";
import Section from "@/components/home/Section";
import { selectFetchMeStatus, selectMe } from "@/redux/users/users.selectors";
import { fetchMyProfile } from "@/redux/users/users.thunks";
import AdsCarousel from "@/components/home/AdsCarousel";
import MealCardSkeleton from "@/components/home/MealCardSkeleton";
import { useRouter } from "expo-router";
import SearchBar from "@/components/search/SearchBar";

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectMealsListStatus);
  const fetchMestatus = useAppSelector(selectFetchMeStatus);
  const error = useAppSelector(selectMealsError);

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

  return (
    <View className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: Platform.select({ android: 40, ios: 60 }),
        }}
      >
        {/* top greeting + location */}
        <View className="px-4 pt-6">
          <Text className="text-neutral-500 font-satoshiMedium">
            Welcome, {me?.first_name}
          </Text>
          <Text className="text-[32px] font-satoshiBold text-neutral-900 mt-1">
            Eat Your Fav!
          </Text>

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

        <Section
          title="Vendors Close By"
          onSeeAll={() => router.push("/users/category/vendors")}
          data={status === "loading" ? Array.from({ length: 4 }) : vendors}
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

        {status === "failed" && !!error && (
          <Text className="px-4 mt-6 text-red-600">{error}</Text>
        )}
      </ScrollView>
    </View>
  );
}
