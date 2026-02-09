import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenCreateOutletScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [manager, setManager] = useState("");
  const [hours, setHours] = useState("");

  const handleSave = () => {
    showSuccess("Outlet created");
    router.back();
  };

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Create Outlet
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {[
          { label: "Outlet name", value: name, onChange: setName },
          { label: "Address", value: address, onChange: setAddress },
          { label: "Phone number", value: phone, onChange: setPhone },
          { label: "Manager name", value: manager, onChange: setManager },
          { label: "Working hours", value: hours, onChange: setHours },
        ].map((field) => (
          <View key={field.label} className="mb-4">
            <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.label}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`rounded-2xl px-3 py-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
              }`}
            />
          </View>
        ))}

        <Pressable onPress={handleSave} className="bg-primary rounded-2xl py-4 items-center">
          <Text className="text-white font-satoshiBold">Save Outlet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
