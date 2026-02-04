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
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import KitchenCard from "@/components/home/KitchenCard";
import { mockKitchens } from "@/utils/mockData";

// adjust paths to match your structure
import { fetchKitchenTypes } from "@/redux/kitchen/kitchen.thunks";
import {
  selectTypes,
  selectTypesStatus,
} from "@/redux/kitchen/kitchen.selectors"; // or kitchen.selectors
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

type KitchensStatus = "idle" | "loading" | "succeeded" | "failed";

export default function AllKitchensScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const types = useAppSelector(selectTypes);
  const typesStatus = useAppSelector(selectTypesStatus) as KitchensStatus;

  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null); // null = "All"

  const fetchKitchens = async () => {
    try {
      setLoading(true);

      const items = mockKitchens;
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
    <View className={`flex-1 pt-20 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <View className="flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-4 mb-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#E5E7EB" : "#000"} />
        </Pressable>

        <Text className={`flex-1 text-2xl font-satoshiBold mb-4 mr-8 ${isDark ? "text-white" : "text-neutral-900"}`}>
          All Kitchens
        </Text>
      </View>

      {/* Type filter tabs */}
      <View className="px-4 mb-2">
        {typesStatus === "loading" ? (
          <View className="flex-row items-center py-2">
            <ActivityIndicator size="small" color="#ffa800" />
            <Text className={`ml-2 text-xs font-satoshiMedium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
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
          className={`px-4 py-3 rounded-2xl font-satoshiMedium border ${
            isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-[#F5F5F5] border-transparent"
          }`}
          placeholder="Search kitchens..."
          placeholderTextColor={isDark ? "#6B7280" : undefined}
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
        renderItem={({ item }) => (
          <View style={{ width: "48%" }}>
            <KitchenCard kitchen={item} />
          </View>
        )}
        ListEmptyComponent={
          <View className="p-6">
            <Text className={`text-center ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
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
  const isDark = useAppSelector(selectThemeMode) === "dark";
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 px-4 py-2 rounded-full border ${
        isActive
          ? "bg-primary border-primary"
          : isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-[#F5F5F5] border-[#E5E7EB]"
      }`}
    >
      <Text
        className={`text-xs font-satoshiMedium ${
          isActive ? "text-white" : isDark ? "text-neutral-300" : "text-neutral-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};
