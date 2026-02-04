import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();

  // gentle float animation for the search icon
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateY]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ transform: [{ translateY }] }}>
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border border-primary-500">
            <Ionicons name="search-outline" size={36} color="#ffa800" />
          </View>
        </Animated.View>

        <Text className="mt-6 text-[24px] text-neutral-900 font-satoshiBold text-center">
          Page not found
        </Text>
        <Text className="mt-2 text-neutral-600 font-satoshi text-center">
          The page you’re looking for doesn’t exist or was moved.
        </Text>

        <View className="mt-7 w-full">
          {/* <Pressable
            onPress={() => router.back()}
            className="bg-primary rounded-2xl py-4 items-center justify-center border border-primary-500"
          >
            <Text className="text-white font-satoshiBold">Go Back</Text>
          </Pressable> */}

          <Pressable
            onPress={() => router.replace("/")}
            className="mt-3 bg-primary rounded-2xl py-4 items-center justify-center border border-neutral-200"
          >
            <Text className="text-neutral-900 font-satoshiBold">
              Back to Home
            </Text>
          </Pressable>
        </View>

        <Text className="mt-8 text-neutral-400 font-satoshi text-[12px]">
          404 • FoodHut
        </Text>
      </View>
    </SafeAreaView>
  );
}
