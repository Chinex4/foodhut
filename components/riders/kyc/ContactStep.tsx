import React from "react";
import { Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  nokName: string;
  setNokName: (v: string) => void;
  nokRelationship: string;
  setNokRelationship: (v: string) => void;
  nokPhone: string;
  setNokPhone: (v: string) => void;
  nokAddress: string;
  setNokAddress: (v: string) => void;
  isDark: boolean;
};

export default function ContactStep({
  nokName,
  setNokName,
  nokRelationship,
  setNokRelationship,
  nokPhone,
  setNokPhone,
  nokAddress,
  setNokAddress,
  isDark,
}: Props) {
  return (
    <View className="mt-4">
      <Text className={`text-sm font-satoshiMedium mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Next of Full Name
      </Text>
      <TextInput
        value={nokName}
        onChangeText={setNokName}
        placeholder="Enter Next of Kin details"
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className={`rounded-2xl px-4 py-3 font-satoshi text-base ${
          isDark ? "bg-neutral-900 text-white" : "bg-[#ececec] text-black"
        }`}
      />

      <Text className={`text-sm font-satoshiMedium mt-5 mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Relationship to You
      </Text>
      <TextInput
        value={nokRelationship}
        onChangeText={setNokRelationship}
        placeholder="Enter Next of Kin details"
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className={`rounded-2xl px-4 py-3 font-satoshi text-base ${
          isDark ? "bg-neutral-900 text-white" : "bg-[#ececec] text-black"
        }`}
      />

      <Text className={`text-sm font-satoshiMedium mt-5 mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Phone Number
      </Text>
      <View className={`rounded-2xl flex-row items-center px-4 py-3 ${
        isDark ? "bg-neutral-900" : "bg-[#ececec]"
      }`}>
        <View className="flex-row items-center mr-3">
          <Text className="text-lg mr-1">🇳🇬</Text>
          <Text className={`font-satoshiMedium text-base ${isDark ? "text-neutral-200" : "text-black"}`}>+234</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
            style={{ marginLeft: 4 }}
          />
        </View>
        <TextInput
          value={nokPhone}
          onChangeText={setNokPhone}
          keyboardType="number-pad"
          placeholder="Enter Number"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 font-satoshi text-base ${isDark ? "text-white" : "text-black"}`}
        />
      </View>

      <Text className={`text-sm font-satoshiMedium mt-5 mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Address
      </Text>
      <TextInput
        value={nokAddress}
        onChangeText={setNokAddress}
        placeholder="Enter Address"
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className={`rounded-2xl px-4 py-3 font-satoshi text-base ${
          isDark ? "bg-neutral-900 text-white" : "bg-[#ececec] text-black"
        }`}
      />
    </View>
  );
}
