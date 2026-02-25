import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorMeals } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenEditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const meal = useMemo(() => mockVendorMeals.find((item) => item.id === id), [id]);

  const [name, setName] = useState(meal?.name ?? "");
  const [price, setPrice] = useState(meal?.price?.replace(/[^0-9.]/g, "") ?? "");
  const [portion, setPortion] = useState(meal?.portion ?? "Regular");
  const [desc, setDesc] = useState(meal?.description ?? "");
  const [available, setAvailable] = useState(meal?.available ?? true);

  const save = () => {
    showSuccess("Meal updated");
    router.back();
  };

  if (!meal) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle" size={28} color={palette.danger} />
        <Text className="mt-2 font-satoshiBold text-[18px]" style={{ color: palette.textPrimary }}>
          Meal not found
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-2xl px-5 py-3" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white font-satoshiBold">Go back</Text>
        </Pressable>
      </View>
    );
  }

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
            Edit Meal
          </Text>
        </View>

        <Pressable className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? palette.dangerSoft : "#FFF1F2" }}>
          <Ionicons name="trash-outline" size={18} color={palette.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
            Meal name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Price
          </Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Portion type
          </Text>
          <View className="flex-row items-center">
            {(["Single", "Regular", "Large"] as const).map((item) => {
              const active = portion === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setPortion(item)}
                  className="rounded-full px-4 py-2 mr-2"
                  style={{
                    backgroundColor: active ? palette.accentSoft : palette.surfaceAlt,
                    borderWidth: 1,
                    borderColor: active ? palette.accentStrong : palette.border,
                  }}
                >
                  <Text className="text-[12px] font-satoshiBold" style={{ color: active ? palette.accentStrong : palette.textSecondary }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Description
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            textAlignVertical="top"
            className="rounded-2xl px-3 py-3 text-[15px] min-h-[110px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            placeholderTextColor={palette.textMuted}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                In stock
              </Text>
              <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
                Hide meal automatically when unavailable
              </Text>
            </View>

            <Switch
              value={available}
              onValueChange={setAvailable}
              thumbColor={available ? palette.accent : "#F8FAFC"}
              trackColor={{ false: "#CBD5E1", true: isDark ? "#5A4512" : "#F6C56B" }}
              ios_backgroundColor="#CBD5E1"
            />
          </View>
        </View>

        <Pressable onPress={save} className="mt-5 rounded-2xl py-4 items-center" style={{ backgroundColor: palette.accent }}>
          <Text className="text-white font-satoshiBold text-[16px]">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
