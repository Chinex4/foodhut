import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorMeals, type VendorMeal } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

type MenuFilter = "ALL" | "PACKAGES" | "PER_PORTION";

export default function KitchenMenuScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"DELIVERY" | "SITIN">("DELIVERY");
  const [filter, setFilter] = useState<MenuFilter>("ALL");
  const [meals, setMeals] = useState<VendorMeal[]>(mockVendorMeals);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return meals.filter((meal) => {
      const supportsMode =
        mode === "DELIVERY" ? meal.deliveryEnabled : meal.sitInEnabled;
      const inSearch =
        !q ||
        meal.name.toLowerCase().includes(q) ||
        meal.description.toLowerCase().includes(q);

      if (!inSearch || !supportsMode) return false;

      if (filter === "PACKAGES") {
        return meal.portion.toLowerCase().includes("large");
      }

      if (filter === "PER_PORTION") {
        return !meal.portion.toLowerCase().includes("large");
      }

      return true;
    });
  }, [meals, query, filter, mode]);

  const toggleAvailable = (id: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, available: !meal.available } : meal
      )
    );
  };

  const updateDiscount = (id: string, delta: number) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== id) return meal;
        const current = meal.discountPercent ?? 0;
        return { ...meal, discountPercent: Math.max(0, Math.min(80, current + delta)) };
      })
    );
  };

  const removeMeal = () => {
    if (!deleteId) return;
    setMeals((prev) => prev.filter((meal) => meal.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[22px] leading-[28px] font-satoshiBold"
            style={{ color: palette.textPrimary }}
          >
            Manage Menu
          </Text>

          <Pressable
            onPress={() => router.push("/kitchen/(tabs)/menu/create")}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: palette.accent }}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Pressable>
        </View>

        <View
          className="mt-6 rounded-3xl px-5 py-4 flex-row items-center"
          style={{
            backgroundColor: palette.surfaceAlt,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Ionicons name="search" size={24} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search meals..."
            placeholderTextColor={palette.textMuted}
            className="ml-3 text-[16px] flex-1 font-satoshi"
            style={{ color: palette.textPrimary }}
          />
        </View>

        <View className="mt-5 flex-row items-center">
          {([
            { key: "ALL", label: "All Items" },
            { key: "PACKAGES", label: "Packages" },
            { key: "PER_PORTION", label: "Per Portion" },
          ] as const).map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                className="rounded-full px-4 py-3 mr-3"
                style={{
                  backgroundColor: active ? (isDark ? "#0B0F16" : "#16181D") : palette.surfaceAlt,
                  borderWidth: active ? 0 : 1,
                  borderColor: palette.border,
                }}
              >
                <Text
                  className="font-satoshiBold text-[13px]"
                  style={{ color: active ? "#fff" : palette.textSecondary }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3 flex-row">
          {(["DELIVERY", "SITIN"] as const).map((item) => {
            const active = mode === item;
            return (
              <Pressable
                key={item}
                onPress={() => setMode(item)}
                className="rounded-full px-4 py-2 mr-2"
                style={{
                  backgroundColor: active ? palette.accentSoft : "transparent",
                  borderWidth: 1,
                  borderColor: active ? palette.accentStrong : palette.border,
                }}
              >
                <Text
                  className="font-satoshiBold text-[12px]"
                  style={{ color: active ? palette.accentStrong : palette.textSecondary }}
                >
                  {item === "DELIVERY" ? "Delivery" : "Sit-in"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5">
          {filtered.map((meal) => {
            const hasDiscount = (meal.discountPercent ?? 0) > 0;

            return (
              <View
                key={meal.id}
                className="rounded-[28px] p-4 mb-4"
                style={{
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <View className="flex-row">
                  <View
                    className="w-[88px] h-[88px] rounded-2xl items-center justify-center"
                    style={{
                      backgroundColor: isDark ? palette.elevated : "#EEF2F7",
                    }}
                  >
                    <View
                      className="absolute top-2 left-2 rounded-full px-2 py-1"
                      style={{
                        backgroundColor: meal.portion.toLowerCase().includes("large")
                          ? "#A78BFA"
                          : "#22C55E",
                      }}
                    >
                      <Text className="text-white text-[8px] font-satoshiBold">
                        {meal.portion.toLowerCase().includes("large")
                          ? "FULL PACKAGE"
                          : "PER PORTION"}
                      </Text>
                    </View>

                    <Ionicons
                      name="restaurant"
                      size={30}
                      color={isDark ? palette.accentStrong : "#6B7280"}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="font-satoshiBold text-[14px] leading-[22px] flex-1"
                        style={{ color: palette.textPrimary }}
                        numberOfLines={1}
                      >
                        {meal.name}
                      </Text>

                      <View className="flex-row items-center ml-2">
                        <Pressable
                          onPress={() => router.push(`/kitchen/(tabs)/menu/${meal.id}`)}
                          className="mr-2"
                        >
                          <Ionicons name="create-outline" size={18} color={palette.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => setDeleteId(meal.id)}>
                          <Ionicons name="trash-outline" size={18} color={palette.textMuted} />
                        </Pressable>
                      </View>
                    </View>

                    <Text
                      className="mt-1 text-[12px]"
                      style={{ color: palette.textSecondary }}
                      numberOfLines={1}
                    >
                      {meal.description}
                    </Text>

                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text
                          className="font-satoshiBold text-[14px] leading-[22px]"
                          style={{ color: palette.accentStrong }}
                        >
                          {meal.price}
                        </Text>
                        {hasDiscount ? (
                          <Text
                            className="text-[12px] line-through ml-2"
                            style={{ color: palette.textMuted }}
                          >
                            {`₦${Math.round(
                              Number(meal.price.replace(/[^0-9]/g, "")) /
                                (1 - (meal.discountPercent ?? 0) / 100)
                            ).toLocaleString()}`}
                          </Text>
                        ) : null}
                      </View>

                      <Pressable
                        onPress={() => toggleAvailable(meal.id)}
                        className="rounded-full px-2 py-1"
                        style={{
                          backgroundColor: meal.available
                            ? isDark
                              ? "#1F3D2F"
                              : "#E9FBEF"
                            : isDark
                            ? "#2A313F"
                            : "#ECEFF4",
                        }}
                      >
                        <View className="flex-row items-center">
                          <Text
                            className="text-[10px] font-satoshiBold"
                            style={{
                              color: meal.available ? palette.success : palette.textMuted,
                            }}
                          >
                            {meal.available ? "IN STOCK" : "OUT OF STOCK"}
                          </Text>
                          <View
                            className="size-4 rounded-full ml-2"
                            style={{
                              backgroundColor: meal.available ? palette.accent : palette.textMuted,
                            }}
                          />
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View
                  className="mt-4 pt-3 flex-row items-center justify-between"
                  style={{ borderTopWidth: 1, borderTopColor: palette.border }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="pricetag" size={16} color={palette.accentStrong} />
                    <Pressable onPress={() => updateDiscount(meal.id, 5)}>
                      <Text
                        className="ml-2 font-satoshiBold text-[11px]"
                        style={{ color: palette.accentStrong }}
                      >
                        {hasDiscount
                          ? `${meal.discountPercent}% OFF VOUCHER`
                          : "ADD DISCOUNT"}
                      </Text>
                    </Pressable>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="link" size={15} color={palette.textMuted} />
                    <Text
                      className="ml-2 text-[11px] font-satoshiBold"
                      style={{ color: palette.textMuted }}
                    >
                      RELATED MEALS
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/kitchen/profile/qr")}
        className="absolute right-5 bottom-8 w-16 h-16 rounded-full items-center justify-center"
        style={{
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.border,
        }}
      >
        <Ionicons name="qr-code" size={26} color={palette.textSecondary} />
      </Pressable>

      <Modal visible={!!deleteId} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: palette.overlay }}
        >
          <View
            className="w-full rounded-[26px] p-5"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Text className="text-[18px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              Delete this meal?
            </Text>
            <Text className="text-[14px] mt-2" style={{ color: palette.textSecondary }}>
              This removes the item from your current local menu list.
            </Text>

            <View className="flex-row mt-5">
              <Pressable
                onPress={() => setDeleteId(null)}
                className="flex-1 rounded-2xl py-3 items-center mr-2"
                style={{ backgroundColor: palette.surfaceAlt }}
              >
                <Text className="font-satoshiBold" style={{ color: palette.textSecondary }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={removeMeal}
                className="flex-1 rounded-2xl py-3 items-center ml-2"
                style={{ backgroundColor: palette.accent }}
              >
                <Text className="text-white font-satoshiBold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
