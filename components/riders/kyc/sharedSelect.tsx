// components/riders/kyc/sharedSelect.tsx
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export const ID_TYPES = ["National ID Card", "Driver's License", "Passport"];

type SimpleSelectProps = {
  placeholder: string;
  title?: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
  isDark?: boolean;
};

export function SimpleSelect({
  placeholder,
  title,
  value,
  options,
  onChange,
  isDark = false,
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
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
          name="chevron-down"
          size={18}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />
        <View
          className={`rounded-t-3xl p-4 max-h-[65%] ${
            isDark ? "bg-neutral-950 border-t border-neutral-800" : "bg-white"
          }`}
        >
          <View className={`h-1.5 w-12 self-center rounded-full mb-3 ${isDark ? "bg-neutral-700" : "bg-gray-300"}`} />
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`text-xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {title || placeholder}
            </Text>
            <Pressable onPress={() => setOpen(false)} className="p-2">
              <Ionicons name="close" size={20} color={isDark ? "#E5E7EB" : "#111827"} />
            </Pressable>
          </View>

          {options.map((opt) => {
            const selected = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-4 py-4 rounded-2xl mb-2 flex-row items-center justify-between ${
                  selected
                    ? "bg-primary/20"
                    : isDark
                      ? "bg-neutral-900"
                      : "bg-neutral-100"
                }`}
              >
                <Text className={`font-satoshi text-base ${isDark ? "text-white" : "text-black"}`}>
                  {opt}
                </Text>
                {selected && <Ionicons name="checkmark" size={18} color="#ffa800" />}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}
