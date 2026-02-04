import FloatingCartButton from "@/components/cart/FloatingCartButton";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { selectCartItemQuantity } from "@/redux/cart/cart.selectors";
import { setCartItem } from "@/redux/cart/cart.thunks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import { mockKitchens, mockMeals, mockKitchenTypes } from "@/utils/mockData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

type City = {
  id: string;
  name: string;
  state: string;
};

type Meal = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  is_available: boolean;
  rating: string | number;
  likes: number;
  kitchen_id: string;
  cover_image?: {
    url: string;
  } | null;
};

type Kitchen = {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  type: string | null;
  delivery_time: string | null;
  preparation_time: string | null;
  rating: string | null;
  is_available: boolean;
  opening_time: string | null;
  closing_time: string | null;
  cover_image: string | null;
  city?: City | null;
};

function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function KitchenMealRow({
  item,
  isDark,
}: {
  item: Meal;
  isDark: boolean;
}) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const qty = useAppSelector(selectCartItemQuantity(item.kitchen_id, item.id));

  const addOne = async () => {
    if (!isAuthenticated) {
      // allow but warn elsewhere if needed
    }
    await dispatch(setCartItem({ mealId: item.id, quantity: qty + 1 }));
  };

  const setQty = async (next: number) => {
    await dispatch(setCartItem({ mealId: item.id, quantity: next }));
  };

  return (
    <Pressable
      onPress={() => router.push(`/users/meal/${item.id}` as any)}
      className={`rounded-2xl border overflow-hidden flex-row ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
    >
      <View
        className={`w-28 h-28 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
      >
        {item.cover_image?.url ? (
          <Image
            source={{ uri: item.cover_image.url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("@/assets/images/food1.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
      </View>
      <View className="flex-1 p-4 justify-between">
        <View>
          <Text
            numberOfLines={1}
            className={`font-satoshiBold text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            className={`text-[13px] mt-1 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            {item.description}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-3">
          <Text className="font-satoshiBold text-primary text-[15px]">
            {formatNGN(Number(item.price))}
          </Text>
          {qty > 0 ? (
            <QuantityStepper isDark={isDark} value={qty} onChange={setQty} />
          ) : (
            <Pressable
              onPress={addOne}
              className="px-3 py-1 rounded-full bg-primary"
            >
              <Text className="text-white text-[12px] font-satoshiBold">
                Add
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function KitchenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const [loading, setLoading] = useState(true);
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchen = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const source = mockKitchens.find((item) => item.id === id);
      const data = source
        ? ({
            id: source.id,
            name: source.name,
            address: source.address,
            phone_number: source.phone_number,
            type: source.type ?? null,
            delivery_time: source.delivery_time ?? null,
            preparation_time: source.preparation_time ?? null,
            rating: source.rating ? String(source.rating) : null,
            is_available: source.is_available,
            opening_time: source.opening_time ?? null,
            closing_time: source.closing_time ?? null,
            cover_image: source.cover_image?.url ?? null,
            city: source.city
              ? {
                  id: source.city.id,
                  name: source.city.name,
                  state: source.city.state,
                }
              : null,
          } as Kitchen)
        : null;
      setKitchen(data);
    } catch (e: any) {
      console.log("Fetch kitchen error", e);
      setError("Unable to load kitchen details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMeals = useCallback(async () => {
    if (!id) return;
    try {
      const data = mockMeals.filter((meal) => meal.kitchen_id === id) as Meal[];
      setMeals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.log("Fetch meals error", e);
      // Don't fail the page if meals fail to load
    }
  }, [id]);

  useEffect(() => {
    fetchKitchen();
    fetchMeals();
  }, [fetchKitchen, fetchMeals]);

  const imageUri = useMemo(() => {
    if (!kitchen) return null;
    const value = kitchen.cover_image;
    if (typeof value === "string" && value.trim() !== "") return value;
    return null;
  }, [kitchen]);

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}
      >
        <ActivityIndicator color="#ffa800" size="large" />
      </View>
    );
  }

  if (!kitchen || error) {
    return (
      <View
        className={`flex-1 items-center justify-center px-6 ${isDark ? "bg-neutral-950" : "bg-white"}`}
      >
        <Text
          className={`text-[16px] font-satoshiBold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          Oops
        </Text>
        <Text
          className={`text-center mb-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
        >
          {error || "Kitchen could not be found."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-5 py-3 rounded-2xl bg-primary"
        >
          <Text className="text-white font-satoshiMedium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rating = Number(kitchen.rating || 0).toFixed(1);
  const locationLabel = kitchen.city
    ? `${kitchen.city.name}, ${kitchen.city.state}`
    : "";
  const openLabel = kitchen.is_available ? "Open now" : "Closed";
  const timeLabel = kitchen.delivery_time || kitchen.preparation_time || "";
  const openClose =
    kitchen.opening_time && kitchen.closing_time
      ? `${kitchen.opening_time} - ${kitchen.closing_time}`
      : null;


  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* HEADER with back + image */}
      <View className="relative h-72 bg-secondary">
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[40px] font-satoshiBold text-primary">
              {getInitials(kitchen.name)}
            </Text>
          </View>
        )}

        {/* gradient overlay could be added with expo-linear-gradient if you want */}

        {/* top bar */}
        <View className="absolute top-20 left-4 right-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push("/users/kitchen")}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>

          <View className="flex-row gap-x-2">
            {/* Placeholder for favourite / share later */}
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* title + rating row */}
        <View className="px-4 pt-4">
          <Text
            className={`text-[20px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            {kitchen.name}
          </Text>

          <Text
            className={`mt-1 text-[13px] font-satoshiMedium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            {kitchen.type || "Cuisine"}
            {locationLabel ? ` • ${locationLabel}` : ""}
          </Text>

          <View className="mt-3 flex-row items-center gap-x-2">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/users/reviews/[id]",
                  params: { id: kitchen.id, type: "kitchen" },
                })
              }
              className="flex-row items-center px-2 py-1 rounded-full bg-[#FFF7E6]"
            >
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text className="ml-1 text-[12px] font-satoshiBold text-primary">
                {rating}
              </Text>
            </Pressable>

            {timeLabel ? (
              <View
                className={`flex-row items-center px-2 py-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-[#F3F4F6]"}`}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text
                  className={`ml-1 text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
                >
                  {timeLabel}
                </Text>
              </View>
            ) : null}

            <View
              className={`flex-row items-center px-2 py-1 rounded-full ${
                kitchen.is_available ? "bg-[#E5F9F0]" : "bg-neutral-200"
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  kitchen.is_available ? "bg-[#059669]" : "bg-neutral-500"
                }`}
              />
              <Text
                className={`text-[12px] font-satoshiMedium ${
                  kitchen.is_available ? "text-[#059669]" : "text-neutral-500"
                }`}
              >
                {openLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* info cards */}
        <View className="px-4 mt-5 space-y-3">
          {/* address */}
          <View
            className={`flex-row rounded-3xl p-3 ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-[#F9FAFB]"}`}
          >
            <View
              className={`w-9 h-9 rounded-2xl items-center justify-center mr-3 ${isDark ? "bg-neutral-800" : "bg-white"}`}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-[13px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                Address
              </Text>
              <Text
                className={`mt-1 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
              >
                {kitchen.address || "Not provided"}
              </Text>
            </View>
          </View>

          {/* hours */}
          <View
            className={`flex-row rounded-3xl p-3 ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-[#F9FAFB]"}`}
          >
            <View
              className={`w-9 h-9 rounded-2xl items-center justify-center mr-3 ${isDark ? "bg-neutral-800" : "bg-white"}`}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-[13px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                Opening hours
              </Text>
              <Text
                className={`mt-1 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
              >
                {openClose || "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* categories */}
        <View className="px-4 mt-6">
          <Text
            className={`text-[16px] font-satoshiBold mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Categories
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {mockKitchenTypes.map((type) => (
              <View
                key={type}
                className={`px-3 py-2 rounded-full ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-[#FFF7E6] border border-[#FFE7C2]"}`}
              >
                <Text
                  className={`text-[12px] font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-800"}`}
                >
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meals Section */}
        {meals.length > 0 && (
          <View className="mt-6">
            <Text
              className={`px-4 text-[18px] font-satoshiBold mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              Menu ({meals.length})
            </Text>

            <FlatList
              data={meals}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <KitchenMealRow item={item} isDark={isDark} />
              )}
            />
          </View>
        )}
      </ScrollView>
      <FloatingCartButton onPress={() => router.push("/users/(tabs)/orders")} />
    </View>
  );
}
