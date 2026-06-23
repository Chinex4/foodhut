import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, View } from "react-native";

import { getStorageFileUrl } from "@/api/storage";
import { ENV } from "@/config/env";

const normalizeMediaUrl = (url?: string | null) => {
  const clean = url?.trim();
  if (!clean) return null;
  if (/^https?:\/\//i.test(clean)) return clean;

  const base = ENV.API_BASE_URL.replace(/\/$/, "");
  return `${base}/${clean.replace(/^\//, "")}`;
};

export function getKitchenMealImageUrl({
  coverUrl,
  coverImageId,
}: {
  coverUrl?: string | null;
  coverImageId?: string | null;
}) {
  return normalizeMediaUrl(coverUrl) ?? getStorageFileUrl(coverImageId);
}

export default function KitchenMealImage({
  coverUrl,
  coverImageId,
  className,
  iconName = "restaurant-outline",
  iconColor,
}: {
  coverUrl?: string | null;
  coverImageId?: string | null;
  className: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  const uri = getKitchenMealImageUrl({ coverUrl, coverImageId });
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View className={`${className} items-center justify-center bg-neutral-200`}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      className={className}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
