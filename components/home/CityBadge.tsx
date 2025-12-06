import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface CityBadgeProps {
  city: KitchenCity | null;
  onPress?: () => void;
  size?: "sm" | "md" | "lg";
  showState?: boolean;
}

/**
 * Reusable city badge component for displaying selected city
 * Can be used in headers, cards, or anywhere you need to show the current city
 */
export default function CityBadge({
  city,
  onPress,
  size = "md",
  showState = true,
}: CityBadgeProps) {
  if (!city) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-primary-50 rounded-full px-3 py-2"
      >
        <MaterialCommunityIcons
          name="map-marker-question"
          size={16}
          color="#9CA3AF"
        />
        <Text className="ml-2 text-sm font-satoshi text-neutral-500">
          Set City
        </Text>
      </Pressable>
    );
  }

  const sizeConfig = {
    sm: { padding: "px-2 py-1", textSize: "text-xs", iconSize: 12 },
    md: { padding: "px-3 py-2", textSize: "text-sm", iconSize: 16 },
    lg: { padding: "px-4 py-3", textSize: "text-base", iconSize: 20 },
  };

  const config = sizeConfig[size];

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center bg-white rounded-full border-2 border-primary-50 ${config.padding}`}
    >
      <MaterialCommunityIcons
        name="map-marker"
        size={config.iconSize as number}
        color="#ffa800"
      />
      <View className="ml-2">
        <Text className={`font-satoshiMedium text-neutral-900 ${config.textSize}`}>
          {city.name}
        </Text>
        {showState && (
          <Text className="text-neutral-500 font-satoshi text-xs">
            {city.state}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
