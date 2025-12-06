// app/users/riders/[id]/ratings.tsx
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function RiderRatings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const reviews = Array.from({ length: 5 }).map((_, i) => ({
    id: String(i),
    name: "Ade Right",
    when: i === 0 ? "Today" : `${i + 1} days ago`,
    rating: Math.max(1, 5 - i),
    text: "Update your password to keep your account secure. Choose a strong password for your account.",
  }));

  const render = ({ item }: any) => (
    <View
      className={`rounded-2xl border p-3 mb-3 ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require("@/assets/images/logo-transparent.png")}
            className={`w-8 h-8 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
          />
          <Text
            className={`ml-2 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            {item.name}
          </Text>
        </View>
        <Text className={`text-[12px] ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
          {item.when}
        </Text>
      </View>
      <View className="flex-row mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < item.rating ? "star" : "star-outline"}
            size={14}
            color={i < item.rating ? "#f59e0b" : isDark ? "#4b5563" : "#d1d5db"}
          />
        ))}
      </View>
      <Text className={`mt-2 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
        {item.text} <Text className="text-primary">See all</Text>
      </Text>
    </View>
  );

  return (
    <View className={`flex-1 px-5 pt-20 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <Pressable onPress={() => router.back()} className="mb-3">
        <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
      </Pressable>

      <Text className={`text-2xl font-satoshiBold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
        Riders Ratings
      </Text>
      <Text className={`mb-2 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
        Rate Your Experience With Rider
      </Text>

      {/* interactive stars */}
      <View className="flex-row mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Pressable key={i} onPress={() => setStars(i + 1)}>
            <Ionicons
              name={i < stars ? "star" : "star-outline"}
              size={24}
              color={i < stars ? "#f59e0b" : isDark ? "#4b5563" : "#d1d5db"}
            />
          </Pressable>
        ))}
      </View>

      {/* feedback box */}
      <View className="flex-row items-start">
        <TextInput
          placeholder="Say something..."
          value={text}
          onChangeText={setText}
          multiline
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 rounded-2xl px-3 py-3 border ${
            isDark
              ? "bg-neutral-900 border-neutral-800 text-white"
              : "bg-neutral-100 border-transparent text-neutral-900"
          }`}
          style={{ minHeight: 80 }}
        />
        <View className="w-3" />
        <Pressable className="w-12 h-12 rounded-2xl bg-primary items-center justify-center">
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        className="mt-5"
        data={reviews}
        keyExtractor={(x) => x.id}
        renderItem={render}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
