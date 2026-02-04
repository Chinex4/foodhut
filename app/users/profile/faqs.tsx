import React, { useState } from "react";
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

type FaqItem = { id: string; question: string; answer: string };

const FAQS: FaqItem[] = [
  {
    id: "orders",
    question: "Where can I track my order?",
    answer: "Go to Orders → Ongoing to see live status, rider notes, and payment steps.",
  },
  {
    id: "payments",
    question: "How do I change payment method?",
    answer: "If an order is still pending, open it from Orders → Ongoing and tap Complete Payment.",
  },
  {
    id: "support",
    question: "How do I reach support quickly?",
    answer: "Use Get Help to chat or email us. Include your order ID for faster resolution.",
  },
];

export default function ProfileFaqScreen() {
  const router = useRouter();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
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
          FAQs
        </Text>
        <Text
          className={`mt-1 ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          } font-satoshi`}
        >
          Quick answers to common questions about orders, payments, and support.
        </Text>

        <View className="mt-6">
          {FAQS.map((faq) => {
            const open = openIds.has(faq.id);
            return (
              <View key={faq.id} className="mb-3">
                <Pressable
                  onPress={() => toggle(faq.id)}
                  className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${
                    isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                  }`}
                >
                  <Text
                    className={`flex-1 pr-3 font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={open ? "chevron-down" : "chevron-forward"}
                    size={18}
                    color="#9CA3AF"
                  />
                </Pressable>
                {open && (
                  <View
                    className={`px-4 pt-3 pb-4 rounded-2xl -mt-2 border ${
                      isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                    }`}
                  >
                    <Text
                      className={`leading-6 ${
                        isDark ? "text-neutral-300" : "text-neutral-700"
                      }`}
                    >
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
