// components/riders/kyc/sharedSelect.tsx
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export const ID_TYPES = ["National ID Card", "Driver’s License", "Passport"];

type SimpleSelectProps = {
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
  isDark?: boolean;
};

export function SimpleSelect({
  placeholder,
  value,
  options,
  onChange,
  isDark = false,
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className={`rounded-2xl px-4 py-3 flex-row items-center justify-between ${
          isDark ? "bg-neutral-900" : "bg-[#ececec]"
        }`}
      >
        <Text
          className={`font-satoshi text-base ${
            value ? (isDark ? "text-white" : "text-black") : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
      </Pressable>

      {open && (
        <View className={`mt-1 rounded-2xl shadow-lg overflow-hidden ${isDark ? "bg-neutral-900" : "bg-white"}`}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-4 py-3 flex-row items-center justify-between ${
                  selected ? "bg-primary-500/40" : ""
                }`}
              >
                <Text className={`font-satoshi text-base ${isDark ? "text-white" : "text-black"}`}>
                  {opt}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={18} color="#ffa800" />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
