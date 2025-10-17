import { Image, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import type { Meal } from "@/redux/meals/meals.types";
import { formatNGN, toNum } from "@/utils/money";

export default function MealCard({
  item,
  onPress,
  compact = false,
}: {
  item: Meal;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-white rounded-2xl border border-neutral-100 overflow-hidden ${compact ? "w-[200px]" : "w-full"}`}
      style={{
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* cover */}
      <View className={`${compact ? "h-36" : "h-44"} w-full`}>
        {item.cover_image?.url ? (
          <Image
            source={{ uri: item.cover_image.url }}
            className="w-full h-full"
          />
        ) : (
          <View className="flex-1 bg-neutral-100" />
        )}
        <View className="absolute right-3 top-3 bg-white/90 rounded-full px-2 py-1 flex-row items-center">
          <Ionicons name="star" size={14} color="#FFA800" />
          <Text className="ml-1 font-satoshiMedium text-[12px] text-neutral-800">
            {String(item.rating ?? "0")}
          </Text>
        </View>
      </View>

      {/* info */}
      <View className="p-3">
        <Text
          className="font-satoshiMedium text-neutral-900 text-[16px] uppercase"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          className="text-neutral-500 text-[12px] mt-0.5"
          numberOfLines={1}
        >
          {item.description}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-end">
            <Text className="text-neutral-900 font-satoshiBold text-[18px]">
              {formatNGN(item.price)}
            </Text>
            {toNum(item.original_price) > toNum(item.price) && (
              <Text className="ml-2 text-neutral-400 line-through">
                {formatNGN(item.original_price!)}
              </Text>
            )}
          </View>
          <View className="bg-primary rounded-full px-3 py-1">
            <Text className="text-white font-satoshiMedium text-[12px]">
              Add To Cart
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
