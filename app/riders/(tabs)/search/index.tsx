import React, { useMemo, useState } from "react";
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
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockRiderJobs } from "@/utils/mock/mockRider";

export default function RiderSearchScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return mockRiderJobs;
    const q = query.toLowerCase();
    return mockRiderJobs.filter(
      (j) =>
        j.pickup.toLowerCase().includes(q) ||
        j.dropoff.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className={`text-2xl font-satoshiBold ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Search Jobs
            </Text>
            <Pressable
              className={`w-9 h-9 rounded-2xl items-center justify-center ${
                isDark ? "bg-neutral-900" : "bg-white"
              }`}
            >
              <Ionicons name="options-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
            </Pressable>
          </View>

          <View
            className={`flex-row items-center rounded-2xl px-3 py-2 shadow-sm ${
              isDark ? "bg-neutral-900" : "bg-white"
            }`}
          >
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search pickup, dropoff, customer"
              placeholderTextColor="#9CA3AF"
              className={`flex-1 ml-2 font-satoshi text-[14px] ${
                isDark ? "text-neutral-100" : "text-neutral-900"
              }`}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}
              >
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
          {results.map((job) => (
            <View
              key={job.id}
              className={`rounded-2xl px-4 py-3 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {job.id}
                </Text>
                <Text className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {job.fare}
                </Text>
              </View>
              <Text className={`mt-2 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Pickup: {job.pickup}
              </Text>
              <Text className={`mt-1 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Dropoff: {job.dropoff}
              </Text>
              <Text className={`mt-1 text-[12px] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                {job.distance} • {job.eta}
              </Text>
            </View>
          ))}
          {results.length === 0 && (
            <View className="items-center mt-10">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                No jobs found.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
