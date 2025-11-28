import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { api } from "@/api/axios";

type City = {
  id: string;
  name: string;
  state: string;
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

export default function KitchenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchen = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/kitchens/${id}`);
      // If your backend wraps it like { item: {...} } adjust here
      const data = (res.data?.item || res.data) as Kitchen;
      setKitchen(data);
    } catch (e: any) {
      console.log("Fetch kitchen error", e?.response || e);
      setError("Unable to load kitchen details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchen();
  }, [id]);

  const imageUri = useMemo(() => {
    if (!kitchen) return null;
    const value = kitchen.cover_image;
    if (typeof value === "string" && value.trim() !== "") return value;
    return null;
  }, [kitchen]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#ffa800" size="large" />
      </View>
    );
  }

  if (!kitchen || error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-[16px] font-satoshiBold text-neutral-900 mb-2">
          Oops
        </Text>
        <Text className="text-neutral-500 text-center mb-4">
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

  const handleCall = () => {
    if (!kitchen.phone_number) return;
    Linking.openURL(`tel:${kitchen.phone_number}`);
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER with back + image */}
      <View className="relative h-64 bg-secondary">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
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
        <View className="absolute top-12 left-4 right-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

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
          <Text className="text-[20px] font-satoshiBold text-neutral-900">
            {kitchen.name}
          </Text>

          <Text className="mt-1 text-[13px] text-neutral-500 font-satoshiMedium">
            {kitchen.type || "Cuisine"}
            {locationLabel ? ` • ${locationLabel}` : ""}
          </Text>

          <View className="mt-3 flex-row items-center gap-x-2">
            <View className="flex-row items-center px-2 py-1 rounded-full bg-[#FFF7E6]">
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text className="ml-1 text-[12px] font-satoshiBold text-primary">
                {rating}
              </Text>
            </View>

            {timeLabel ? (
              <View className="flex-row items-center px-2 py-1 rounded-full bg-[#F3F4F6]">
                <Ionicons name="time-outline" size={13} color="#6B7280" />
                <Text className="ml-1 text-[12px] text-neutral-600">
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
          <View className="flex-row rounded-3xl bg-[#F9FAFB] p-3">
            <View className="w-9 h-9 rounded-2xl bg-white items-center justify-center mr-3">
              <Ionicons name="location-outline" size={18} color="#4B5563" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-satoshiBold text-neutral-900">
                Address
              </Text>
              <Text className="mt-1 text-[12px] text-neutral-600">
                {kitchen.address || "Not provided"}
              </Text>
            </View>
          </View>

          {/* hours */}
          <View className="flex-row rounded-3xl bg-[#F9FAFB] p-3">
            <View className="w-9 h-9 rounded-2xl bg-white items-center justify-center mr-3">
              <Ionicons name="time-outline" size={18} color="#4B5563" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-satoshiBold text-neutral-900">
                Opening hours
              </Text>
              <Text className="mt-1 text-[12px] text-neutral-600">
                {openClose || "Not specified"}
              </Text>
            </View>
          </View>

          {/* phone */}
          <TouchableOpacity
            onPress={handleCall}
            disabled={!kitchen.phone_number}
            className="flex-row rounded-3xl bg-[#F9FAFB] p-3"
          >
            <View className="w-9 h-9 rounded-2xl bg-white items-center justify-center mr-3">
              <Ionicons name="call-outline" size={18} color="#4B5563" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-satoshiBold text-neutral-900">
                Contact
              </Text>
              <Text className="mt-1 text-[12px] text-neutral-600">
                {kitchen.phone_number || "Not available"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* you can add "Popular meals", "Menu", etc below later */}
        {/* <Section title="Popular meals" ... /> */}
      </ScrollView>
    </View>
  );
}
