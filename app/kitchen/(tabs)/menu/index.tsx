import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorMeals, type VendorMeal } from "@/utils/mock/mockVendor";

export default function KitchenMenuScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"SITIN" | "DELIVERY">("DELIVERY");
  const [meals, setMeals] = useState<VendorMeal[]>(mockVendorMeals);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return meals;
    const q = query.toLowerCase();
    return meals.filter((m) => m.name.toLowerCase().includes(q));
  }, [meals, query]);

  const toggleAvailable = (id: string) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, available: !m.available } : m
      )
    );
  };

  const updateStock = (id: string, delta: number) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m
      )
    );
  };

  const updateDiscount = (id: string, next: number) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, discountPercent: next } : m))
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-2xl font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Menu
          </Text>
          <Pressable
            onPress={() => router.push("/kitchen/(tabs)/menu/create")}
            className="bg-primary rounded-2xl px-4 py-2"
          >
            <Text className="text-white font-satoshiBold">Add Meal</Text>
          </Pressable>
        </View>

        <View className="mt-4 flex-row">
          <View
            className={`flex-1 rounded-2xl px-3 py-2 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search meals"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`${isDark ? "text-white" : "text-neutral-900"} font-satoshi`}
            />
          </View>
          <View className="ml-3 flex-row">
            {["DELIVERY", "SITIN"].map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setMode(opt as any)}
                className={`px-3 py-2 rounded-2xl ml-2 ${
                  mode === opt
                    ? "bg-primary"
                    : isDark
                      ? "bg-neutral-900"
                      : "bg-white"
                }`}
              >
                <Text
                  className={`text-[12px] font-satoshiMedium ${
                    mode === opt
                      ? "text-white"
                      : isDark
                        ? "text-neutral-300"
                        : "text-neutral-700"
                  }`}
                >
                  {opt === "DELIVERY" ? "Delivery" : "Sit-in"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4">
          {filtered.map((meal) => (
            <View
              key={meal.id}
              className={`rounded-3xl p-4 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {meal.name}
                  </Text>
                  <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    {meal.description}
                  </Text>
                </View>
                <Pressable onPress={() => router.push(`/kitchen/(tabs)/menu/${meal.id}`)}>
                  <Ionicons name="create-outline" size={20} color={isDark ? "#E5E7EB" : "#111827"} />
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {meal.price} • {meal.portion}
                </Text>
                <Pressable
                  onPress={() => toggleAvailable(meal.id)}
                  className={`px-3 py-1 rounded-full ${meal.available ? "bg-emerald-100" : "bg-neutral-200"}`}
                >
                  <Text className={`text-[10px] font-satoshiBold ${meal.available ? "text-emerald-700" : "text-neutral-600"}`}>
                    {meal.available ? "Available" : "Out"}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center">
                  <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Stock
                  </Text>
                  <View className="flex-row items-center ml-3">
                    <Pressable
                      onPress={() => updateStock(meal.id, -1)}
                      className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                    >
                      <Ionicons name="remove" size={14} color={isDark ? "#E5E7EB" : "#111827"} />
                    </Pressable>
                    <Text className={`mx-2 text-[12px] ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {meal.stock}
                    </Text>
                    <Pressable
                      onPress={() => updateStock(meal.id, 1)}
                      className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                    >
                      <Ionicons name="add" size={14} color={isDark ? "#E5E7EB" : "#111827"} />
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => setDeleteId(meal.id)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>

              <View className="mt-3">
                <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Discount (%)
                </Text>
                <View className="flex-row items-center mt-2">
                  <Pressable
                    onPress={() => updateDiscount(meal.id, Math.max(0, (meal.discountPercent ?? 0) - 5))}
                    className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                  >
                    <Ionicons name="remove" size={14} color={isDark ? "#E5E7EB" : "#111827"} />
                  </Pressable>
                  <Text className={`mx-2 text-[12px] ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {meal.discountPercent ?? 0}%
                  </Text>
                  <Pressable
                    onPress={() => updateDiscount(meal.id, Math.min(90, (meal.discountPercent ?? 0) + 5))}
                    className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                  >
                    <Ionicons name="add" size={14} color={isDark ? "#E5E7EB" : "#111827"} />
                  </Pressable>
                </View>
              </View>

              <View className="mt-3">
                <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Discount Code
                </Text>
                <View className="flex-row items-center mt-2">
                  <View
                    className={`flex-1 rounded-xl px-3 py-2 border ${
                      isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                    }`}
                  >
                    <Text className={`${isDark ? "text-neutral-300" : "text-neutral-600"} text-[12px]`}>
                      FOODHUT10
                    </Text>
                  </View>
                  <Pressable className="ml-2 px-3 py-2 rounded-xl bg-primary">
                    <Text className="text-white text-[12px] font-satoshiBold">Create</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!deleteId} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className={`w-full rounded-3xl p-5 ${isDark ? "bg-neutral-900" : "bg-white"}`}>
            <Text className={`text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Delete meal?
            </Text>
            <Text className={`text-[12px] mt-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              This action is temporary in demo mode.
            </Text>
            <View className="flex-row mt-4">
              <Pressable
                onPress={() => setDeleteId(null)}
                className={`flex-1 rounded-2xl py-3 items-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
              >
                <Text className={`${isDark ? "text-neutral-200" : "text-neutral-700"}`}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMeals((prev) => prev.filter((m) => m.id !== deleteId));
                  setDeleteId(null);
                }}
                className="flex-1 rounded-2xl py-3 items-center bg-primary ml-3"
              >
                <Text className="text-white font-satoshiBold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
