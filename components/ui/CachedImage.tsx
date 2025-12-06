import React from "react";
import { View } from "react-native";
import { Image, type ImageProps } from "expo-image";

type CachedImageProps = Omit<ImageProps, "source"> & {
  uri?: string | null;
  fallback?: React.ReactNode;
};

const PLACEHOLDER_BLURHASH = "L5H2EC=PM+yV0g-mq.wG9c010J}I";

/**
 * Wrapper around expo-image with disk+memory caching and a soft placeholder.
 * Keeps a single place to tweak caching behaviour across the app.
 */
export function CachedImage({
  uri,
  fallback,
  contentFit = "cover",
  ...imageProps
}: CachedImageProps) {
  if (!uri) {
    if (fallback) return <>{fallback}</>;
    return (
      <View
        className={`bg-neutral-100 ${imageProps.className ?? ""}`}
        style={imageProps.style}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      placeholder={PLACEHOLDER_BLURHASH}
      cachePolicy="memory-disk"
      transition={200}
      contentFit={contentFit}
      {...imageProps}
    />
  );
}

export default CachedImage;
