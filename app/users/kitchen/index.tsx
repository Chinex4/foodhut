import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import KitchenCard from "@/components/home/KitchenCard";
import { api } from "@/api/axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function AllKitchensScreen() {
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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

  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text) {
      setFiltered(kitchens);
      return;
    }

    const q = text.toLowerCase();
    const results = kitchens.filter((k) => k.name.toLowerCase().includes(q));

    setFiltered(results);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ffa800" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-8">
      <View className="flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-4 mb-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <Text className="text-center text-2xl font-satoshiBold mb-4">
          All Kitchens
        </Text>
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
      />

      {filtered.length === 0 && (
        <View className="p-6">
          <Text className="text-center text-neutral-400">
            No kitchens match your search.
          </Text>
        </View>
      )}
    </View>
  );
}
