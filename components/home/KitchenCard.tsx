import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import CachedImage from "../ui/CachedImage";

type Kitchen = {
  id: string;
  name: string;
  cover_image: string | null;
  type: string | null;
  delivery_time: string | null;
  preparation_time: string | null;
  rating: string | null;
  city?: {
    name: string;
    state: string;
  } | null;
  is_available: boolean;
};

export function getKitchenInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  const rating = Number(kitchen.rating || 0).toFixed(1);
  const locationLabel = kitchen.city
    ? `${kitchen.city.name}, ${kitchen.city.state}`
    : "Unknown location";

  const handlePress = () => {
    // Adjust route to your kitchen details screen
    router.push({
      pathname: "/users/kitchen/[id]" as any,
      params: { id: kitchen.id },
    });
  };

  const imageUri =
    typeof kitchen.cover_image === "string" && kitchen.cover_image.trim() !== ""
      ? kitchen.cover_image
      : null;

  return (
    <Pressable
      onPress={handlePress}
      className="w-52 mr-3 rounded-3xl bg-white"
      style={{
        shadowOpacity: 0.07,
        shadowRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* cover */}
      <View className="h-28 rounded-3xl overflow-hidden bg-secondary">
        {imageUri ? (
          <CachedImage uri={imageUri} className="w-full h-full" />
        ) : (
          <View className="flex-1 items-center justify-center bg-secondary">
            <Text className="text-[24px] font-satoshiBold text-primary">
              {getKitchenInitials(kitchen.name)}
            </Text>
          </View>
        )}
      </View>

      {/* content */}
      <View className="px-3 py-3">
        <Text
          numberOfLines={1}
          className="text-[14px] font-satoshiBold text-neutral-900"
        >
          {kitchen.name}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-0.5 text-[11px] text-neutral-500 font-satoshiMedium"
        >
          {kitchen.type || "Cuisine"} • {locationLabel}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="px-1.5 py-0.5 rounded-md bg-[#FFF7E6] mr-1.5">
              <Text className="text-[10px] font-satoshiBold text-primary">
                {rating}
              </Text>
            </View>
            <Text className="text-[11px] text-neutral-500">
              {kitchen.delivery_time || kitchen.preparation_time || "N/A"}
            </Text>
          </View>

          <View
            className={`px-2 py-1 rounded-full ${
              kitchen.is_available ? "bg-[#E5F9F0]" : "bg-neutral-200"
            }`}
          >
            <Text
              className={`text-[10px] font-satoshiMedium ${
                kitchen.is_available ? "text-[#059669]" : "text-neutral-500"
              }`}
            >
              {kitchen.is_available ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
