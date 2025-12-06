import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

const DOCS = [
  { id: "privacy", title: "Privacy Policy", description: "How we collect, use, and protect your data." },
  { id: "terms", title: "Terms of Service", description: "Your rights and obligations when using FoodHut." },
];

export default function LegalScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
      >
        <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center">
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
          Legal
        </Text>
        <Text
          className={`mt-1 ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          } font-satoshi`}
        >
          Learn how we handle your data and the rules for using FoodHut.
        </Text>

        <View className="mt-6 space-y-3">
          {DOCS.map((doc) => (
            <Pressable
              key={doc.id}
              className={`rounded-3xl p-4 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    className={`mt-1 text-[13px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {doc.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
