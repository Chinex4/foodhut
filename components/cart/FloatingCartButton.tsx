import { selectCartTotalItems } from "@/redux/cart/cart.selectors";
import { useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";

type Props = {
  onPress?: () => void;
  label?: string;
};

export default function FloatingCartButton({
  onPress,
  label = "Open orders",
}: Props) {
  const totalItems = useAppSelector(selectCartTotalItems);

  if (totalItems <= 0) return null;

  return (
    <View className="absolute bottom-5 right-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress ?? (() => router.push("/users/(tabs)/orders"))}
        android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
        className="w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-lg"
        style={Platform.select({ android: { elevation: 8 } })}
      >
        <Ionicons name="cart" size={24} color="#fff" />
        {totalItems > 0 ? (
          <View className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 items-center justify-center border border-primary">
            <Text className="text-primary text-[10px] font-satoshiBold">
              {totalItems}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
