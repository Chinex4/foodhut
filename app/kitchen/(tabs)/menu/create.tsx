import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { showSuccess } from "@/components/ui/toast";

export default function KitchenCreateMealScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [portion, setPortion] = useState("Regular");
  const [desc, setDesc] = useState("");
  const [available, setAvailable] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [sitInEnabled, setSitInEnabled] = useState(false);

  const canSave =
    name.trim().length > 0 &&
    price.trim().length > 0 &&
    (deliveryEnabled || sitInEnabled);

  const onSave = () => {
    if (!canSave) return;
    const channels = [
      deliveryEnabled ? "Delivery" : null,
      sitInEnabled ? "Sit-in" : null,
    ]
      .filter(Boolean)
      .join(" & ");
    showSuccess(`Meal created (${channels})`);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-20 pb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
        <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          Create Meal
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          className="rounded-3xl p-4"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="text-[13px] mb-1" style={{ color: palette.textSecondary }}>
            Meal name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Green Goddess Bowl"
            placeholderTextColor={palette.textMuted}
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Price
          </Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="14.50"
            placeholderTextColor={palette.textMuted}
            keyboardType="numeric"
            className="rounded-2xl px-3 py-3 text-[16px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <Text className="text-[13px] mb-1 mt-4" style={{ color: palette.textSecondary }}>
            Portion type
          </Text>
          <View className="flex-row items-center">
            {(["Regular", "Large", "Family"] as const).map((item) => {
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
                  <Text
                    className="font-satoshiBold text-[12px]"
                    style={{ color: active ? palette.accentStrong : palette.textSecondary }}
                  >
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
            placeholder="Fresh kale, avocado and citrus dressing."
            placeholderTextColor={palette.textMuted}
            multiline
            textAlignVertical="top"
            className="rounded-2xl px-3 py-3 text-[15px] min-h-[110px] font-satoshi"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
          />

          <View
            className="rounded-2xl mt-4 p-4"
            style={{ backgroundColor: isDark ? palette.elevated : "#FFF5E2", borderWidth: 1, borderColor: palette.border }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cloud-upload-outline" size={20} color={palette.accentStrong} />
                <Text className="ml-2 font-satoshiBold" style={{ color: palette.accentStrong }}>
                  Upload meal image
                </Text>
              </View>
              <Pressable>
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  Browse
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                Meal is available
              </Text>
              <Text className="text-[12px]" style={{ color: palette.textSecondary }}>
                Show this meal in active menu listings
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

          <View className="mt-4">
            <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              Service channels
            </Text>
            <Text className="text-[12px] mt-0.5" style={{ color: palette.textSecondary }}>
              Choose where customers can order this meal
            </Text>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-[14px] font-satoshiMedium" style={{ color: palette.textPrimary }}>
                Delivery
              </Text>
              <Switch
                value={deliveryEnabled}
                onValueChange={setDeliveryEnabled}
                thumbColor={deliveryEnabled ? palette.accent : "#F8FAFC"}
                trackColor={{ false: "#CBD5E1", true: isDark ? "#5A4512" : "#F6C56B" }}
                ios_backgroundColor="#CBD5E1"
              />
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-[14px] font-satoshiMedium" style={{ color: palette.textPrimary }}>
                Sit-in
              </Text>
              <Switch
                value={sitInEnabled}
                onValueChange={setSitInEnabled}
                thumbColor={sitInEnabled ? palette.accent : "#F8FAFC"}
                trackColor={{ false: "#CBD5E1", true: isDark ? "#5A4512" : "#F6C56B" }}
                ios_backgroundColor="#CBD5E1"
              />
            </View>

            {!deliveryEnabled && !sitInEnabled ? (
              <Text className="text-[12px] mt-3" style={{ color: palette.danger }}>
                Enable at least one service channel to save.
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className="mt-5 rounded-2xl py-4 items-center"
          style={{ backgroundColor: canSave ? palette.accent : palette.textMuted }}
        >
          <Text className="text-white font-satoshiBold text-[16px]">Save Meal</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
