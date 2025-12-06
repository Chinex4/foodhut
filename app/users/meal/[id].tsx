import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CachedImage from "@/components/ui/CachedImage";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectMealById,
  makeSelectMealLikeStatus,
  makeSelectMealByIdStatus,
} from "@/redux/meals/meals.selectors";
import {
  fetchMealById,
  likeMeal,
  unlikeMeal,
} from "@/redux/meals/meals.thunks";

import QuantityStepper from "@/components/ui/QuantityStepper";
import {
  selectCartItemQuantity,
  selectCartFetchStatus,
} from "@/redux/cart/cart.selectors";
import { fetchActiveCart, setCartItem } from "@/redux/cart/cart.thunks";

import { formatNGN, toNum } from "@/utils/money";
import { showError, showSuccess } from "@/components/ui/toast";
import { capitalizeFirst } from "@/utils/capitalize";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <View className={`bg-neutral-200 ${className}`} />
);
const Line = ({ w = "w-2/3", h = "h-4", className = "" }: any) => (
  <Skeleton className={`${w} ${h} rounded ${className}`} />
);

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = id!;
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState(false);

  const meal = useAppSelector(selectMealById(mealId));
  const likeStatusSel = useMemo(
    () => makeSelectMealLikeStatus(mealId),
    [mealId]
  );
  const likeStatus = useAppSelector(likeStatusSel);

  const byIdStatusSel = useMemo(
    () => makeSelectMealByIdStatus(mealId),
    [mealId]
  );
  const byIdStatus = useAppSelector(byIdStatusSel);

  const kitchenId = meal?.kitchen_id ?? "";
  const qty = useAppSelector(selectCartItemQuantity(kitchenId, mealId));
  const cartFetch = useAppSelector(selectCartFetchStatus);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!meal) dispatch(fetchMealById(mealId));
    if (cartFetch === "idle") dispatch(fetchActiveCart());
  }, [mealId, meal, cartFetch, dispatch]);

  const stillFetching = !meal || byIdStatus === "loading";

  if (!meal && stillFetching) {
    return (
      <View className="flex-1 bg-primary-50">
        <StatusBar style="light" />
        {/* cover skeleton */}
        <Skeleton className="h-[25rem] w-full" />
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          <View className="p-4 bg-[#FFF8EC]">
            <Line w="w-3/4" h="h-7" />
            <Line w="w-full" className="mt-3" />
            <Line w="w-5/6" className="mt-2" />
            {/* meta row skeleton */}
            <View className="mt-4 bg-white rounded-2xl px-4 py-4">
              <Line w="w-2/5" />
              <Line w="w-3/5" className="mt-2" />
            </View>
          </View>
        </ScrollView>
        {/* bottom bar skeleton */}
        <View className="absolute bottom-8 left-0 right-0 px-4">
          <View className="flex-row justify-between">
            <Skeleton className="w-36 h-12 rounded-2xl" />
            <Skeleton className="w-40 h-12 rounded-2xl" />
          </View>
        </View>
      </View>
    );
  }

  const isDiscount = toNum(meal!.original_price) > toNum(meal!.price);
  const isLiked = !!meal!.is_liked;

  const toggleLike = async () => {
    try {
      const res = await dispatch(
        isLiked ? unlikeMeal(meal!.id) : likeMeal(meal!.id)
      ).unwrap();
      showSuccess(
        res.message ||
          (isLiked ? "Removed from favorites" : "Added to favorites")
      );
    } catch (err: any) {
      showError(err);
    }
  };

  const setQty = async (next: number) => {
    try {
      const res = await dispatch(
        setCartItem({ mealId, quantity: next })
      ).unwrap();
      showSuccess(res.message || "Cart updated");
    } catch (err: any) {
      showError(err);
    }
  };

  const addOne = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const res = await dispatch(
        setCartItem({ mealId, quantity: qty + 1 })
      ).unwrap();
      showSuccess(res.message || "Added to cart");
    } catch (err: any) {
      showError(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View className="flex-1 bg-primary-50">
      <StatusBar style="light" />

      {/* cover + top bar */}
      <View className="h-[25rem] w-full bg-neutral-100">
        {/* Image skeleton until onLoadEnd */}
        {!imageLoaded && <Skeleton className="absolute inset-0" />}

        {!!meal!.cover_image?.url && (
          <CachedImage
            uri={meal!.cover_image.url}
            className="w-full h-full"
            onLoadEnd={() => setImageLoaded(true)}
          />
        )}

        <View className="absolute top-20 left-4 right-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="bg-black/40 rounded-full p-2"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>

          <Pressable
            onPress={toggleLike}
            disabled={likeStatus === "loading"}
            className="rounded-full p-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              opacity: likeStatus === "loading" ? 0.6 : 1,
            }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#ffa800" : "#8E8E93"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="p-4 bg-[#FFF8EC]">
          {byIdStatus === "loading" ? (
            <>
              <Line w="w-3/4" h="h-7" />
              <Line w="w-full" className="mt-3" />
              <Line w="w-5/6" className="mt-2" />
            </>
          ) : (
            <View className="flex flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-satoshiBold text-neutral-900">
                  {capitalizeFirst(meal!.name)}
                </Text>
                <Text className="mt-2 text-xl text-neutral-600">
                  {capitalizeFirst(meal!.description)}
                </Text>
              </View>
              <View className="rounded-2xl border border-primary px-5 py-3">
                <Text className="text-primary text-2xl font-satoshiBold">
                  {formatNGN(meal!.price)}
                  {isDiscount && (
                    <Text className="text-neutral-400 line-through ml-2">
                      {"  "}
                      {formatNGN(meal!.original_price!)}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* meta row */}
          <View className="mt-4 bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#ffa800" />
              <Text className="ml-2 text-neutral-800">
                {String(meal!.rating)} Ratings
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={16} color="#ffa800" />
              <Text className="ml-2 text-neutral-800">{meal!.likes} Likes</Text>
            </View>
            <QuantityStepper value={qty} onChange={setQty} />
          </View>
        </View>
      </ScrollView>

      {/* bottom bar */}
      {/* bottom bar */}
      <View className="absolute bottom-8 right-0 left-0 p-4 bg-primary-50 border-t border-neutral-100">
        {/** If qty > 0, show "Added to Cart" and disable the button */}
        <Pressable
          onPress={qty > 0 ? undefined : addOne}
          disabled={qty > 0 || adding}
          accessibilityRole="button"
          accessibilityLabel={qty > 0 ? "Added to cart" : "Add to cart"}
          className={[
            "w-full rounded-2xl px-8 py-4 flex-row items-center justify-center",
            qty > 0 ? "bg-secondary" : "bg-primary",
            qty > 0 || adding ? "opacity-90" : "",
          ].join(" ")}
        >
          {qty > 0 ? (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#000" />
              <Text className="ml-2 text-black font-satoshiBold">
                Added to Cart
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="cart" size={18} color="#fff" />
              <Text className="ml-2 text-white font-satoshiBold">
                {adding ? "Adding..." : "Add to Cart"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
