import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

const recent = ["#237895", "Kaduri street", "Umu street", "Pasta order"];
const suggestions = [
  {
    title: "Home area",
    subtitle: "1, Umu street, Lagos",
  },
  {
    title: "Busy pickup spot",
    subtitle: "12, Kaduri street, Lagos",
  },
  {
    title: "Mall / shopping center",
    subtitle: "Shoprite, Lekki, Lagos",
  },
];

export default function RiderSearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 pt-4 pb-2">
          {/* header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-satoshiBold text-black">
              Search
            </Text>
            <Pressable className="w-9 h-9 rounded-2xl bg-white items-center justify-center">
              <Ionicons name="options-outline" size={18} color="#111827" />
            </Pressable>
          </View>

          {/* search input */}
          <View className="flex-row items-center bg-white rounded-2xl px-3 py-2 shadow-sm">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search orders, addresses or customers"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 font-satoshi text-[14px] text-neutral-900"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* recent searches */}
          <Text className="mt-4 mb-2 text-[13px] text-neutral-500 font-satoshi">
            Recent searches
          </Text>
          <View className="flex-row flex-wrap">
            {recent.map((item) => (
              <Pressable
                key={item}
                className="px-3 py-1.5 rounded-full bg-white mr-2 mb-2 border border-neutral-200"
                onPress={() => setQuery(item)}
              >
                <Text className="text-[12px] text-neutral-800 font-satoshi">
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* suggestions */}
          <Text className="mt-4 mb-2 text-[13px] text-neutral-500 font-satoshi">
            Suggested locations
          </Text>
          {suggestions.map((s) => (
            <Pressable
              key={s.title}
              className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3 border border-neutral-100"
            >
              <View className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Ionicons name="location-outline" size={18} color="#ffa800" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-satoshiMedium text-neutral-900">
                  {s.title}
                </Text>
                <Text className="text-[12px] font-satoshi text-neutral-500 mt-0.5">
                  {s.subtitle}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#D1D5DB"
              />
            </Pressable>
          ))}

          {/* empty state / helper copy */}
          <View className="mt-6 bg-white rounded-3xl px-4 py-4">
            <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-1">
              Pro tip
            </Text>
            <Text className="text-[12px] font-satoshi text-neutral-500">
              You can search by order ID, street name, or customer phone number
              to quickly reference a delivery.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
