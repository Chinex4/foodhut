import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

const CHANGELOG = [
  {
    version: "1.4.0",
    title: "Fresh kitchens, better tracking",
    points: [
      "New kitchen cards with image caching for faster browsing.",
      "Ongoing orders auto-refresh every few seconds.",
      "Improved checkout for pay-for-me links.",
    ],
  },
  {
    version: "1.3.2",
    title: "Stability updates",
    points: [
      "Fixed wallet balance display for new accounts.",
      "Resolved push notification delays on Android.",
    ],
  },
];

export default function WhatsNewScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        <Pressable onPress={() => router.push("/users/(tabs)/profile")} className="mb-4 flex-row items-center">
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
          <Text
            className={`ml-1 font-satoshiMedium ${
              isDark ? "text-neutral-200" : "text-neutral-900"
            }`}
          >
            Back
          </Text>
        </Pressable>

        <Text
          className={`text-[22px] font-satoshiBold ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          What’s New
        </Text>
        <Text
          className={`mt-1 ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          } font-satoshi`}
        >
          Release highlights and improvements in the latest builds.
        </Text>

        <View className="mt-6 space-y-4">
          {CHANGELOG.map((item) => (
            <View
              key={item.version}
              className={`rounded-3xl p-4 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className={`font-satoshiBold ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    v{item.version}
                  </Text>
                  <Text
                    className={`${
                      isDark ? "text-neutral-300" : "text-neutral-600"
                    }`}
                  >
                    {item.title}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-satoshiMedium ${
                      isDark ? "text-neutral-200" : "text-primary"
                    }`}
                  >
                    Latest
                  </Text>
                </View>
              </View>

              <View className="mt-3 space-y-2">
                {item.points.map((p) => (
                  <View key={p} className="flex-row items-start">
                    <Ionicons name="ellipse" size={8} color="#F59E0B" style={{ marginTop: 6 }} />
                    <Text
                      className={`ml-2 leading-6 ${
                        isDark ? "text-neutral-300" : "text-neutral-700"
                      }`}
                    >
                      {p}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
