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

export default function RiderRatings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");

  const reviews = Array.from({ length: 5 }).map((_, i) => ({
    id: String(i),
    name: "Ade Right",
    when: i === 0 ? "Today" : `${i + 1} days ago`,
    rating: Math.max(1, 5 - i),
    text: "Update your password to keep your account secure. Choose a strong password for your account.",
  }));

  const render = ({ item }: any) => (
    <View className="bg-white rounded-2xl border border-neutral-100 p-3 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require("@/assets/images/logo-transparent.png")}
            className="w-8 h-8 rounded-full bg-neutral-100"
          />
          <Text className="ml-2 font-satoshiMedium text-neutral-900">
            {item.name}
          </Text>
        </View>
        <Text className="text-[12px] text-neutral-400">{item.when}</Text>
      </View>
      <View className="flex-row mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < item.rating ? "star" : "star-outline"}
            size={14}
            color={i < item.rating ? "#f59e0b" : "#d1d5db"}
          />
        ))}
      </View>
      <Text className="mt-2 text-neutral-600">
        {item.text} <Text className="text-primary">See all</Text>
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary-50 px-5 pt-20">
      <Pressable onPress={() => router.back()} className="mb-3">
        <Ionicons name="chevron-back" size={22} color="#0F172A" />
      </Pressable>

      <Text className="text-2xl font-satoshiBold text-neutral-900 mb-2">
        Riders Ratings
      </Text>
      <Text className="text-neutral-600 mb-2">
        Rate Your Experience With Rider
      </Text>

      {/* interactive stars */}
      <View className="flex-row mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Pressable key={i} onPress={() => setStars(i + 1)}>
            <Ionicons
              name={i < stars ? "star" : "star-outline"}
              size={24}
              color={i < stars ? "#f59e0b" : "#d1d5db"}
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
          className="flex-1 bg-neutral-100 rounded-2xl px-3 py-3"
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
