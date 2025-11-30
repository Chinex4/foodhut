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
};

export default function VehicleStep({
  vehicleType,
  setVehicleType,
  vehicleReg,
  setVehicleReg,
}: Props) {
  return (
    <View className="mt-4">
      <Text className="text-sm font-satoshiMedium text-black mb-2">
        Vehicle Type
      </Text>
      <VehicleSelect
        placeholder="Select Vehicle Type"
        value={vehicleType}
        options={VEHICLE_TYPES}
        onChange={setVehicleType}
      />

      <Text className="text-sm font-satoshiMedium text-black mt-6 mb-2">
        Vehicle Registration Number
      </Text>
      <TextInput
        value={vehicleReg}
        onChangeText={setVehicleReg}
        placeholder="23458N34567"
        className="bg-[#ececec] rounded-2xl px-4 py-3 font-satoshi text-base"
      />
    </View>
  );
}

type VehicleSelectProps = {
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
};

function VehicleSelect({
  placeholder,
  value,
  options,
  onChange,
}: VehicleSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="bg-[#ececec] rounded-2xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text
          className={`font-satoshi text-base ${
            value ? "text-black" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </Pressable>

      {open && (
        <View className="mt-1 bg-white rounded-2xl shadow-lg overflow-hidden">
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
                <Text className="font-satoshi text-base text-black">{opt}</Text>
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
