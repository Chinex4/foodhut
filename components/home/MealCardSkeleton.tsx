import React from "react";
import { View } from "react-native";

export default function MealCardSkeleton({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <View
      className={`bg-white rounded-2xl border border-neutral-100 overflow-hidden ${compact ? "w-[200px]" : "w-full"} animate-pulse`}
    >
      <View className={`${compact ? "h-36" : "h-44"} w-full bg-neutral-200`} />
      <View className="p-3">
        <View className="h-4 bg-neutral-200 rounded w-2/3" />
        <View className="h-3 bg-neutral-200 rounded w-1/3 mt-2" />
        <View className="mt-3 h-6 bg-neutral-200 rounded w-24" />
      </View>
    </View>
  );
}
