// components/riders/kyc/VehicleStep.tsx
import React from "react";
import { Text, TextInput, View } from "react-native";
import { SimpleSelect } from "./sharedSelect";

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
      <SimpleSelect
        placeholder="Select Vehicle Type"
        title="Select Vehicle Type"
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
