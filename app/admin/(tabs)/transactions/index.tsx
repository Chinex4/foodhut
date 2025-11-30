import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const ANALYTIC_TABS = ["Total", "Vendor", "Margin", "Riders"] as const;
type AnalyticTab = (typeof ANALYTIC_TABS)[number];

export default function AdminTransactionsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<AnalyticTab>("Total");
  const [range, setRange] = useState<"today" | "custom">("today");

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Transactions
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Analytics + date */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[18px] font-satoshiBold text-black">
            Analytics
          </Text>
          <Pressable
            onPress={() =>
              setRange((r) => (r === "today" ? "custom" : "today"))
            }
            className="flex-row items-center px-3 py-1.5 rounded-full bg-white"
          >
            <Text className="text-[12px] font-satoshi text-neutral-800 mr-2">
              {range === "today" ? "Today" : "Jan 10 - Feb 5"}
            </Text>
            <Ionicons name="calendar-outline" size={14} color="#4B5563" />
          </Pressable>
        </View>

        {/* analytic tabs */}
        <View className="flex-row mb-3">
          {ANALYTIC_TABS.map((name) => {
            const active = name === tab;
            return (
              <Pressable
                key={name}
                onPress={() => setTab(name)}
                className="mr-4 pb-1"
              >
                <Text
                  className={`text-[13px] font-satoshi ${
                    active ? "text-neutral-900" : "text-gray-400"
                  }`}
                >
                  {name}
                </Text>
                {active && (
                  <View className="h-1 rounded-full bg-primary mt-1" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Total summary / print */}
        <View className="flex-row items-center justify-between bg-white rounded-3xl px-4 py-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center mr-3">
              <Ionicons name="calculator-outline" size={18} color="#111827" />
            </View>
            <View>
              <Text className="text-[11px] text-neutral-500 font-satoshi">
                Total
              </Text>
              <Text className="text-[16px] font-satoshiBold text-neutral-900">
                NGN678,000
              </Text>
            </View>
          </View>

          <Pressable className="flex-row items-center">
            <Text className="text-[12px] font-satoshiMedium text-primary mr-1">
              Print Statement
            </Text>
            <Ionicons name="print-outline" size={16} color="#ffa800" />
          </Pressable>
        </View>

        {/* Fake chart */}
        <View className="bg-white rounded-3xl px-4 py-4 mb-4">
          <View className="h-40 rounded-2xl bg-primary/10 overflow-hidden mb-3">
            {/* simple bars to mimic area chart */}
            <View className="flex-1 flex-row items-end justify-between px-4 pb-4">
              {[0.3, 0.6, 0.5, 0.8, 0.4].map((h, idx) => (
                <View
                  key={idx}
                  style={{ height: `${h * 100}%` }}
                  className="w-7 rounded-t-2xl bg-primary"
                />
              ))}
            </View>
          </View>

          <View className="flex-row justify-between">
            {["6:0", "9:0", "12:00", "15:00", "18:00", "21:00"].map((t) => (
              <Text
                key={t}
                className="text-[10px] text-neutral-400 font-satoshi"
              >
                {t}
              </Text>
            ))}
          </View>
        </View>

        {/* History */}
        <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-2">
          Transaction History
        </Text>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 mb-2"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#6B7280"
              />
              <View className="ml-3">
                <Text className="text-[12px] font-satoshiMedium text-neutral-900">
                  Trnxid: 12538989
                </Text>
                <Text className="text-[11px] text-neutral-500 font-satoshi">
                  April 10th, 5:45pm
                </Text>
              </View>
            </View>
            <Text className="text-[12px] font-satoshiMedium text-neutral-900">
              NGN 6,500
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
