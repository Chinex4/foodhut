import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorOutlets } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenOutletsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);
  const [outlets, setOutlets] = useState(mockVendorOutlets);

  const setActive = (id: string) => {
    setOutlets((prev) => prev.map((outlet) => ({ ...outlet, active: outlet.id === id })));
    showSuccess("Outlet switched");
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Manage Outlets
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/kitchen/profile/outlets-create")}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: palette.accent }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {outlets.map((outlet) => (
          <View
            key={outlet.id}
            className="rounded-3xl p-4 mb-3"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                {outlet.name}
              </Text>
              {outlet.active ? (
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: isDark ? "#1F3D2F" : "#E9FBEF" }}>
                  <Text className="text-[11px] font-satoshiBold" style={{ color: palette.success }}>
                    ACTIVE
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
              {outlet.address}
            </Text>

            <View className="flex-row mt-4">
              <Pressable
                onPress={() => setActive(outlet.id)}
                className="rounded-2xl px-4 py-3 mr-2"
                style={{ backgroundColor: outlet.active ? palette.accentSoft : palette.surfaceAlt }}
              >
                <Text className="font-satoshiBold" style={{ color: outlet.active ? palette.accentStrong : palette.textSecondary }}>
                  {outlet.active ? "Current Outlet" : "Make Active"}
                </Text>
              </Pressable>

              <Pressable
                className="rounded-2xl px-4 py-3"
                style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceAlt }}
              >
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  Access Control
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable
          onPress={() => router.push("/kitchen/profile/outlets-create")}
          className="mt-2 rounded-2xl py-4 items-center"
          style={{ backgroundColor: palette.accent }}
        >
          <Text className="text-white font-satoshiBold">Create Outlet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
