import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorMeals } from "@/utils/mock/mockVendor";

export default function KitchenEditMealScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { id } = useLocalSearchParams<{ id: string }>();
  const meal = useMemo(() => mockVendorMeals.find((m) => m.id === id), [id]);

  const [name, setName] = useState(meal?.name ?? "");
  const [price, setPrice] = useState(meal?.price ?? "");
  const [portion, setPortion] = useState(meal?.portion ?? "");
  const [desc, setDesc] = useState(meal?.description ?? "");

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Edit Meal
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {[{ label: "Meal name", value: name, onChange: setName },
          { label: "Price", value: price, onChange: setPrice },
          { label: "Portion type", value: portion, onChange: setPortion }].map((field) => (
          <View key={field.label} className="mb-4">
            <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.label}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`rounded-2xl px-3 py-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
              }`}
            />
          </View>
        ))}

        <View className="mb-4">
          <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            Description
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Meal description"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            multiline
            className={`rounded-2xl px-3 py-3 border min-h-[100px] ${
              isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            }`}
          />
        </View>

        <Pressable className="bg-primary rounded-2xl py-4 items-center">
          <Text className="text-white font-satoshiBold">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
