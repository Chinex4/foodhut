import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import KitchenCard from "@/components/home/KitchenCard";
import { api } from "@/api/axios";

// adjust paths to match your structure
import { fetchKitchenTypes } from "@/redux/kitchen/kitchen.thunks";
import {
  selectTypes,
  selectTypesStatus,
} from "@/redux/kitchen/kitchen.selectors"; // or kitchen.selectors

type KitchensStatus = "idle" | "loading" | "succeeded" | "failed";

export default function AllKitchensScreen() {
  const dispatch = useDispatch();

  const types = useSelector(selectTypes);
  const typesStatus = useSelector(selectTypesStatus) as KitchensStatus;

  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null); // null = "All"

  const fetchKitchens = async () => {
    try {
      setLoading(true);

      const res = await api.get("/kitchens", {
        params: {
          per_page: 100,
          page: 1,
          is_available: true,
        },
      });

      const items = res.data?.items ?? [];
      setKitchens(items);
      setFiltered(items);
    } catch (err) {
      console.log("Fetch kitchens err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  // fetch kitchen types for filter tabs
  useEffect(() => {
    (dispatch as any)(fetchKitchenTypes());
  }, [dispatch]);

  // keep search simple, and let a separate effect handle actual filtering
  const handleSearch = (text: string) => {
    setSearch(text);
  };

  // recompute filtered list whenever kitchens, search, or activeType change
  useEffect(() => {
    let data = [...kitchens];

    if (activeType) {
      const t = activeType.toLowerCase();
      data = data.filter(
        (k) => (k.type || "").toLowerCase() === t
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((k) => k.name.toLowerCase().includes(q));
    }

    setFiltered(data);
  }, [kitchens, search, activeType]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ffa800" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-20">
      {/* Header */}
      <View className="flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-4 mb-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <Text className="flex-1 text-2xl font-satoshiBold mb-4 mr-8">
          All Kitchens
        </Text>
      </View>

      {/* Type filter tabs */}
      <View className="px-4 mb-2">
        {typesStatus === "loading" ? (
          <View className="flex-row items-center py-2">
            <ActivityIndicator size="small" color="#ffa800" />
            <Text className="ml-2 text-xs text-neutral-500 font-satoshiMedium">
              Loading kitchen types...
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            <FilterChip
              label="All"
              isActive={!activeType}
              onPress={() => setActiveType(null)}
            />

            {types.map((t) => (
              <FilterChip
                key={t}
                label={t}
                isActive={activeType === t}
                onPress={() => setActiveType(t)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <TextInput
          className="bg-[#F5F5F5] px-4 py-3 rounded-2xl font-satoshiMedium"
          placeholder="Search kitchens..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        renderItem={({ item }) => <KitchenCard kitchen={item} />}
        ListEmptyComponent={
          <View className="p-6">
            <Text className="text-center text-neutral-400">
              No kitchens match your search.
            </Text>
          </View>
        }
      />
    </View>
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, isActive, onPress }: FilterChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 px-4 py-2 rounded-full border ${
        isActive
          ? "bg-primary border-primary"
          : "bg-[#F5F5F5] border-[#E5E7EB]"
      }`}
    >
      <Text
        className={`text-xs font-satoshiMedium ${
          isActive ? "text-white" : "text-neutral-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};
