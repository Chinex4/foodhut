import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

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
  const isDark = useAppSelector(selectThemeMode) === "dark";
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
      className={`w-52 mr-3 rounded-3xl ${isDark ? "bg-neutral-900" : "bg-white"}`}
      style={{
        shadowOpacity: isDark ? 0 : 0.07,
        shadowRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        borderWidth: 1,
        borderColor: isDark ? "#1F2937" : "#F3F4F6",
      }}
    >
      {/* cover */}
      <View className="h-28 rounded-3xl overflow-hidden bg-secondary">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
          />
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
          className={`text-[14px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          {kitchen.name}
        </Text>

        <Text
          numberOfLines={1}
          className={`mt-0.5 text-[11px] font-satoshiMedium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
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
            <Text className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {kitchen.delivery_time || kitchen.preparation_time || "N/A"}
            </Text>
          </View>

          <View
            className={`px-2 py-1 rounded-full ${
              kitchen.is_available ? "bg-[#E5F9F0]" : isDark ? "bg-neutral-800" : "bg-neutral-200"
            }`}
          >
            <Text
              className={`text-[10px] font-satoshiMedium ${
                kitchen.is_available ? "text-[#059669]" : isDark ? "text-neutral-500" : "text-neutral-500"
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
