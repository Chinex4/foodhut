import React from "react";
import { Pressable, Text, View } from "react-native";

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  isDark
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  isDark?: boolean;
}) {
  return (
    <View className="flex-row items-center rounded-xl border border-neutral-200 overflow-hidden">
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-2 bg-neutral-100"
      >
        <Text className="text-[16px] font-satoshiBold">−</Text>
      </Pressable>
      <View className="px-4 py-2">
        <Text className={`text-[16px] font-satoshiBold ${isDark && 'text-white'}`}>{value}</Text>
      </View>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2 bg-neutral-100"
      >
        <Text className="text-[16px] font-satoshiBold">+</Text>
      </Pressable>
    </View>
  );
}
