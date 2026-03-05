import React, { useEffect, useState } from "react";
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

export default function KitchenVendorsSection() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectListStatus);
  const kitchens = useAppSelector(selectKitchensList);
  const error = useAppSelector(selectKitchensError);
  const [loading, setLoading] = useState(false);

  const loadKitchens = async () => {
    try {
      setLoading(true);
      await dispatch(
        fetchKitchens({
          page: 1,
          per_page: 10,
          is_available: true,
        })
      ).unwrap();
    } catch {
      // handled by store error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "idle") {
      loadKitchens();
    }
  }, [status]);

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
      renderItem={({ item }: { item: any }) => (
        <KitchenCard kitchen={item} />
      )}
    />
  );
}
