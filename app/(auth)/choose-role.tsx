import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChooseRoleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      <View className="flex-1 px-5">
        {/* Top spacer & tiny heading */}
        <View className="mt-8">
          <Text className="text-3xl font-satoshiBold text-black">
            Choose your role
          </Text>
          <Text className="text-base text-gray-600 font-satoshi mt-2">
            Continue as a user or sign on as a rider/kitchen.
          </Text>
        </View>

        {/* Middle icon / placeholder copy */}
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <Text className="text-6xl">🍽️</Text>
            <Text className="text-gray-700 font-satoshi mt-3">
              FOODHUT — flexible for everyone
            </Text>
          </View>
        </View>

        {/* Bottom actions */}
        <View className="pb-8">
          {/* Full width primary */}
          <Pressable
            onPress={() => router.replace("/users/(tabs)")}
            className="bg-primary rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-satoshiMedium text-lg">
              Continue as User
            </Text>
          </Pressable>

          {/* Two side-by-side */}
          <View className="mt-3 flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(auth)/register-rider")}
              className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center"
            >
              <Text className="text-black font-satoshiMedium">
                Sign on as Rider
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/register-kitchen")}
              className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center"
            >
              <Text className="text-black font-satoshiMedium">
                Sign on as Kitchen
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
