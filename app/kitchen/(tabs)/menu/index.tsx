import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { deleteMealById } from "@/redux/meals/meals.thunks";
import { showError, showSuccess } from "@/components/ui/toast";
import { formatNGN } from "@/utils/money";

export default function KitchenMenuScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const { meals, mealsStatus, refreshMeals } = useKitchenData({ ordersStatus: null });

  const [query, setQuery] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return meals;
    return meals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(q) ||
        meal.description.toLowerCase().includes(q)
    );
  }, [meals, query]);

  const removeMeal = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteMealById(deleteId)).unwrap();
      showSuccess("Meal deleted");
      setDeleteId(null);
      await refreshMeals();
    } catch (error: any) {
      showError(error?.message || "Failed to delete meal");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[22px] leading-[28px] font-satoshiBold" style={{ color: palette.textPrimary }}>
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
          style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}
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

        {mealsStatus === "loading" && !meals.length ? (
          <View className="items-center mt-10">
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : null}

        <View className="mt-5">
          {filtered.map((meal) => (
            <View
              key={meal.id}
              className="rounded-[28px] p-4 mb-4"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text
                    className="font-satoshiBold text-[14px] leading-[22px]"
                    style={{ color: palette.textPrimary }}
                    numberOfLines={1}
                  >
                    {meal.name}
                  </Text>
                  <Text className="mt-1 text-[12px]" style={{ color: palette.textSecondary }} numberOfLines={2}>
                    {meal.description}
                  </Text>
                  <Text className="mt-2 font-satoshiBold text-[14px]" style={{ color: palette.accentStrong }}>
                    {formatNGN(Number(meal.price))}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => router.push(`/kitchen/(tabs)/menu/${meal.id}` as any)}
                    className="mr-3"
                  >
                    <Ionicons name="create-outline" size={20} color={palette.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => setDeleteId(meal.id)}>
                    <Ionicons name="trash-outline" size={20} color={palette.textMuted} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {!filtered.length && mealsStatus !== "loading" ? (
          <View className="items-center mt-10">
            <Text style={{ color: palette.textSecondary }}>No meals found.</Text>
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/kitchen/profile/qr")}
        className="absolute right-5 bottom-8 w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Ionicons name="qr-code" size={26} color={palette.textSecondary} />
      </Pressable>

      <Modal visible={!!deleteId} transparent animationType="fade">
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: palette.overlay }}>
          <View className="w-full rounded-[26px] p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
            <Text className="text-[18px] font-satoshiBold" style={{ color: palette.textPrimary }}>
              Delete this meal?
            </Text>
            <Text className="text-[14px] mt-2" style={{ color: palette.textSecondary }}>
              This will remove the meal from your kitchen menu.
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
    </View>
  );
}
