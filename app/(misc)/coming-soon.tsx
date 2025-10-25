import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function ComingSoonScreen() {
  const router = useRouter();

  // Simple pulse animation for the gift icon
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-1 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <Text className="text-[18px] font-satoshiBold text-neutral-900">
          Coming Soon
        </Text>
      </View>

      {/* Body */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ transform: [{ scale }] }}>
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border border-primary-500">
            <Ionicons name="sparkles-outline" size={36} color="#ffa800" />
          </View>
        </Animated.View>

        <Text className="mt-5 text-[24px] text-neutral-900 font-satoshiBold text-center">
          Something tasty is baking…
        </Text>
        <Text className="mt-2 text-neutral-600 font-satoshi text-center">
          We’re putting the final touches on this feature. Check back soon!
        </Text>

        {/* CTA row */}
        <View className="mt-7 w-full">
          <Pressable
            onPress={() => router.back()}
            className="bg-primary rounded-2xl py-4 items-center justify-center border border-primary-500"
          >
            <Text className="text-white font-satoshiBold">Go Back</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")} // send them home
            className="mt-3 bg-white rounded-2xl py-4 items-center justify-center border border-neutral-200"
          >
            <Text className="text-neutral-900 font-satoshiBold">
              Back to Home
            </Text>
          </Pressable>
        </View>

        {/* tiny footer */}
        <Text className="mt-8 text-neutral-400 font-satoshi text-[12px]">
          FoodHut • v1.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
