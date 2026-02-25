import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showSuccess } from "@/components/ui/toast";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenCreateOutletScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [manager, setManager] = useState("");
  const [hours, setHours] = useState("");

  const canSave = name.trim() && address.trim() && phone.trim();

  const handleSave = () => {
    if (!canSave) return;
    showSuccess("Outlet created");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Create Outlet
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          {[
            { label: "Outlet name", value: name, onChange: setName },
            { label: "Address", value: address, onChange: setAddress },
            { label: "Phone number", value: phone, onChange: setPhone },
            { label: "Manager name", value: manager, onChange: setManager },
            { label: "Working hours", value: hours, onChange: setHours },
          ].map((field) => (
            <View key={field.label} className="mb-4">
              <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={field.label}
                placeholderTextColor={palette.textMuted}
                className="rounded-2xl px-3 py-3 text-[15px] font-satoshi"
                style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
              />
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          className="mt-5 rounded-2xl py-4 items-center"
          style={{ backgroundColor: canSave ? palette.accent : palette.textMuted }}
        >
          <Text className="text-white font-satoshiBold">Save Outlet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
