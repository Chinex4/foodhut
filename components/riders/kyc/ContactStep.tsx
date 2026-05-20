import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Country = { name: string; dial_code: string; code: string };

const flagFromCode = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

const stripDialCode = (dial: string, value: string) => {
  const normalized = value.replace(/\s/g, "");
  if (normalized.startsWith(dial)) return normalized.slice(dial.length);
  const dialDigits = dial.replace(/\D/g, "");
  if (normalized.startsWith(dialDigits)) return normalized.slice(dialDigits.length);
  return normalized.replace(/^0+/, "");
};

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
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [country, setCountry] = useState<Country>({
    name: "Nigeria",
    dial_code: "+234",
    code: "NG",
  });
  const localPhone = useMemo(
    () => stripDialCode(country.dial_code, nokPhone),
    [country.dial_code, nokPhone]
  );

  const setLocalPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setNokPhone(`${country.dial_code}${digits}`);
  };

  const handlePickCountry = (next: Country) => {
    const currentLocal = stripDialCode(country.dial_code, nokPhone).replace(/\D/g, "");
    setCountry(next);
    setNokPhone(`${next.dial_code}${currentLocal}`);
  };

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
        <Pressable
          onPress={() => setCountryPickerOpen(true)}
          className="flex-row items-center mr-3"
        >
          <Text className="text-lg mr-1">{flagFromCode(country.code)}</Text>
          <Text className={`font-satoshiMedium text-base ${isDark ? "text-neutral-200" : "text-black"}`}>
            {country.dial_code}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
            style={{ marginLeft: 4 }}
          />
        </Pressable>
        <TextInput
          value={localPhone}
          onChangeText={setLocalPhone}
          keyboardType="number-pad"
          placeholder="Enter Number"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 font-satoshi text-base ${isDark ? "text-white" : "text-black"}`}
        />
      </View>
      <CountryCodePickerModal
        visible={countryPickerOpen}
        onClose={() => setCountryPickerOpen(false)}
        onPick={handlePickCountry}
      />

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
