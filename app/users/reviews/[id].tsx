import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import { mockReviews } from "@/utils/mockData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

type Review = (typeof mockReviews)[number];

export default function ReviewsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();

  const items = useMemo(
    () =>
      mockReviews.filter(
        (r) => r.target_id === id && r.target_type === (type ?? "meal")
      ),
    [id, type]
  );
  const [name, setName] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  const avg = useMemo(() => {
    if (!items.length) return "0.0";
    const sum = items.reduce((t, r) => t + r.rating, 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="pt-16 pb-4 px-5">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#0F172A"} />
          </Pressable>
          <Text
            className={`text-2xl font-satoshiBold ml-2 ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Reviews
          </Text>
        </View>

        <View
          className={`mt-4 rounded-2xl border p-3 flex-row items-center justify-between ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View>
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Average rating
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FFA800" />
              <Text className={`ml-2 text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {avg}
              </Text>
            </View>
          </View>
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {items.length} review{items.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <FlatList<Review>
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        ListHeaderComponent={
          <View
            className={`rounded-2xl border p-4 mb-4 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={`font-satoshiBold text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}>
              Add a review
            </Text>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Share your experience (demo only).
            </Text>
            <View className="mt-3">
              <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Your name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className={`rounded-xl px-3 py-3 border ${isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"}`}
              />
            </View>
            <View className="mt-3">
              <Text className={`text-[12px] mb-2 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Rating
              </Text>
              <View className="flex-row items-center">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRating(r)}
                    className="mr-2"
                  >
                    <Ionicons
                      name={rating >= r ? "star" : "star-outline"}
                      size={18}
                      color={rating >= r ? "#FFA800" : isDark ? "#6B7280" : "#9CA3AF"}
                    />
                  </Pressable>
                ))}
                <Text className={`ml-2 text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <View className="mt-3">
              <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Comment
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Write your review..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                multiline
                className={`rounded-xl px-3 py-3 border min-h-[90px] ${isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"}`}
              />
            </View>
            <Pressable className="mt-4 bg-primary rounded-2xl py-3 items-center">
              <Text className="text-white font-satoshiBold">Submit Review</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              No reviews yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            className={`rounded-2xl border p-4 mb-3 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {item.user_name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FFA800" />
                <Text className={`ml-1 text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text className={`mt-2 text-[13px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {item.comment}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
