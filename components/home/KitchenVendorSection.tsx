import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Section from "./Section";
import KitchenCard from "./KitchenCard";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchKitchens } from "@/redux/kitchen/kitchen.thunks";
import {
  selectKitchensError,
  selectKitchensList,
  selectListStatus,
} from "@/redux/kitchen/kitchen.selectors";
import type { KitchenCity } from "@/redux/kitchen/kitchen.types";

export default function KitchenVendorsSection({
  selectedCity,
}: {
  selectedCity?: KitchenCity | null;
}) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectListStatus);
  const kitchens = useAppSelector(selectKitchensList);
  const error = useAppSelector(selectKitchensError);
  const [loading, setLoading] = useState(false);

  const loadKitchens = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(
        fetchKitchens({
          page: 1,
          per_page: 50,
          is_available: true,
        })
      ).unwrap();
    } catch {
      // handled by store error
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === "idle") {
      loadKitchens();
    }
  }, [loadKitchens, status, selectedCity?.id]);

  const visibleKitchens = React.useMemo(() => {
    if (!selectedCity) return kitchens.slice(0, 10);

    const inCity = kitchens.filter((k) => k.city_id === selectedCity.id);
    return (inCity.length ? inCity : kitchens).slice(0, 10);
  }, [kitchens, selectedCity]);

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

  if (error || visibleKitchens.length === 0) {
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
      data={visibleKitchens}
      onSeeAll={() => router.push("/users/kitchen")}
      renderItem={({ item }: { item: any }) => (
        <KitchenCard kitchen={item} />
      )}
    />
  );
}
