import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Section from "./Section";
import KitchenCard from "./KitchenCard";
import { api } from "@/api/axios";
import { router } from "expo-router";

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

type KitchensApiResponse = {
  items: KitchenResponseItem[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

export default function KitchenVendorsSection() {
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<KitchenResponseItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchens = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await api.get<KitchensApiResponse>("/kitchens", {
        params: {
          per_page: 10,
          page: 1,
          is_available: true,
        },
      });

      setKitchens(res.data.items || []);
    } catch (e: any) {
      console.log("Error loading kitchens", e?.response || e);
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
