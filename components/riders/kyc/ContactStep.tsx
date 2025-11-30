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
}: Props) {
  return (
    <View className="mt-4">
      <Text className="text-sm font-satoshiMedium text-black mb-2">
        Next of Full Name
      </Text>
      <TextInput
        value={nokName}
        onChangeText={setNokName}
        placeholder="Enter Next of Kin details"
        className="bg-[#ececec] rounded-2xl px-4 py-3 font-satoshi text-base"
      />

      <Text className="text-sm font-satoshiMedium text-black mt-5 mb-2">
        Relationship to You
      </Text>
      <TextInput
        value={nokRelationship}
        onChangeText={setNokRelationship}
        placeholder="Enter Next of Kin details"
        className="bg-[#ececec] rounded-2xl px-4 py-3 font-satoshi text-base"
      />

      <Text className="text-sm font-satoshiMedium text-black mt-5 mb-2">
        Phone Number
      </Text>
      <View className="bg-[#ececec] rounded-2xl flex-row items-center px-4 py-3">
        <View className="flex-row items-center mr-3">
          <Text className="text-lg mr-1">🇳🇬</Text>
          <Text className="font-satoshiMedium text-base">+234</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#6B7280"
            style={{ marginLeft: 4 }}
          />
        </View>
        <TextInput
          value={nokPhone}
          onChangeText={setNokPhone}
          keyboardType="number-pad"
          placeholder="Enter Number"
          className="flex-1 font-satoshi text-base"
        />
      </View>

      <Text className="text-sm font-satoshiMedium text-black mt-5 mb-2">
        Address
      </Text>
      <TextInput
        value={nokAddress}
        onChangeText={setNokAddress}
        placeholder="Enter Address"
        className="bg-[#ececec] rounded-2xl px-4 py-3 font-satoshi text-base"
      />
    </View>
  );
}
