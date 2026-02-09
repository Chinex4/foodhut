// components/riders/kyc/VehicleStep.tsx
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const VEHICLE_TYPES = ["Bike", "Bicycle", "Car", "Others"];

type Props = {
  vehicleType: string | null;
  setVehicleType: (v: string | null) => void;
  vehicleReg: string;
  setVehicleReg: (v: string) => void;
  isDark: boolean;
};

export default function VehicleStep({
  vehicleType,
  setVehicleType,
  vehicleReg,
  setVehicleReg,
  isDark,
}: Props) {
  return (
    <View className="mt-4">
      <Text className={`text-sm font-satoshiMedium mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Vehicle Type
      </Text>
      <VehicleSelect
        placeholder="Select Vehicle Type"
        value={vehicleType}
        options={VEHICLE_TYPES}
        onChange={setVehicleType}
        isDark={isDark}
      />

      <Text className={`text-sm font-satoshiMedium mt-6 mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Vehicle Registration Number
      </Text>
      <TextInput
        value={vehicleReg}
        onChangeText={setVehicleReg}
        placeholder="23458N34567"
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className={`rounded-2xl px-4 py-3 font-satoshi text-base ${
          isDark ? "bg-neutral-900 text-white" : "bg-[#ececec] text-black"
        }`}
      />
    </View>
  );
}

type VehicleSelectProps = {
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
  isDark: boolean;
};

function VehicleSelect({
  placeholder,
  value,
  options,
  onChange,
  isDark,
}: VehicleSelectProps) {
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
