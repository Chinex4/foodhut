import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Section from "./Section";
import KitchenCard from "./KitchenCard";
import { router } from "expo-router";
import { mockKitchens } from "@/utils/mockData";

type KitchenResponseItem = {
  id: string;
  name: string;
  cover_image: string | null;
  type: string | null;
  delivery_time: string | null;
  preparation_time: string | null;
  rating: string | null;
  is_available: boolean;
  city?: {
    name: string;
    state: string;
  } | null;
};

export default function KitchenVendorsSection() {
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<KitchenResponseItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchens = async () => {
    try {
      setError(null);
      setLoading(true);

      const items = mockKitchens
        .filter((k) => k.is_available)
        .slice(0, 10)
        .map((k) => ({
          id: k.id,
          name: k.name,
          cover_image: k.cover_image?.url ?? null,
          type: k.type ?? null,
          delivery_time: k.delivery_time ?? null,
          preparation_time: k.preparation_time ?? null,
          rating: String(k.rating ?? "0"),
          is_available: k.is_available,
          city: k.city
            ? { name: k.city.name, state: k.city.state }
            : null,
        }));

      setKitchens(items || []);
    } catch (e: any) {
      console.log("Error loading kitchens", e);
      setError("Unable to load kitchens right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  if (loading) {
    return (
      <View className="mt-6 px-4 flex-row items-center">
        <ActivityIndicator color="#ffa800" />
        <Text className="ml-2 text-[13px] text-neutral-500">
          Loading kitchens near you...
        </Text>
      </View>
    );
  }

  if (error || kitchens.length === 0) {
    return (
      <View className="mt-6 px-4">
        <Text className="text-[14px] text-neutral-500">
          {error || "No kitchen vendors are available at the moment."}
        </Text>
      </View>
    );
  }

  return (
    <Section
      title="Kitchen vendors"
      horizontal
      data={kitchens}
      onSeeAll={() => router.push("/users/kitchen")}
      renderItem={({ item }: { item: KitchenResponseItem }) => (
        <KitchenCard kitchen={item} />
      )}
    />
  );
}
