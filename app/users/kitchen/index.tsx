import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import KitchenCard from "@/components/home/KitchenCard";
import { fetchKitchens, fetchKitchenTypes } from "@/redux/kitchen/kitchen.thunks";
import {
  selectKitchensError,
  selectKitchensList,
  selectListStatus,
  selectTypes,
  selectTypesStatus,
} from "@/redux/kitchen/kitchen.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function AllKitchensScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const kitchens = useAppSelector(selectKitchensList);
  const listStatus = useAppSelector(selectListStatus);
  const listError = useAppSelector(selectKitchensError);

  const types = useAppSelector(selectTypes);
  const typesStatus = useAppSelector(selectTypesStatus);

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const uniqueTypes = useMemo(() => Array.from(new Set(types)), [types]);

  useEffect(() => {
    if (typesStatus === "idle") {
      dispatch(fetchKitchenTypes());
    }
  }, [dispatch, typesStatus]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchKitchens({
          page: 1,
          per_page: 50,
          is_available: true,
          search: search.trim() || undefined,
          type: activeType ?? undefined,
        })
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [dispatch, search, activeType]);

  const loading = listStatus === "loading" && kitchens.length === 0;
  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return kitchens.filter((k) => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }, [kitchens]);

  return (
    <View className={`flex-1 pt-20 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-4 mb-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#E5E7EB" : "#000"}
          />
        </Pressable>

        <Text
          className={`flex-1 text-2xl font-satoshiBold mb-4 mr-8 ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          All Kitchens
        </Text>
      </View>

      <View className="px-4 mb-2">
        {typesStatus === "loading" ? (
          <View className="flex-row items-center py-2">
            <ActivityIndicator size="small" color="#ffa800" />
            <Text
              className={`ml-2 text-xs font-satoshiMedium ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
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

            {uniqueTypes.map((t, index) => (
              <FilterChip
                key={`type:${t}:${index}`}
                label={t}
                isActive={activeType === t}
                onPress={() => setActiveType(t)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View className="px-4 mb-4">
        <TextInput
          className={`px-4 py-3 rounded-2xl font-satoshiMedium border ${
            isDark
              ? "bg-neutral-900 border-neutral-800 text-white"
              : "bg-[#F5F5F5] border-transparent"
          }`}
          placeholder="Search kitchens..."
          placeholderTextColor={isDark ? "#6B7280" : undefined}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffa800" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `kitchen:${item.id}:${index}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: "48%" }}>
              <KitchenCard kitchen={item as any} grid />
            </View>
          )}
          ListEmptyComponent={
            <View className="p-6">
              <Text
                className={`text-center ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                {listError || "No kitchens match your search."}
              </Text>
            </View>
          }
        />
      )}
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
