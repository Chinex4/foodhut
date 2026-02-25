import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorOrders } from "@/utils/mock/mockVendor";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenOrderDetailsScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useMemo(() => mockVendorOrders.find((item) => item.id === id), [id]);

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
          Order Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {order ? (
          <View className="rounded-3xl p-4" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-satoshiBold text-[16px]" style={{ color: palette.textPrimary }}>
                {order.id}
              </Text>
              <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.accentSoft }}>
                <Text className="text-[11px] font-satoshiBold" style={{ color: palette.accentStrong }}>
                  {order.status}
                </Text>
              </View>
            </View>

            <Text className="text-[14px] mt-1" style={{ color: palette.textSecondary }}>
              Customer: {order.customer}
            </Text>
            <Text className="text-[14px]" style={{ color: palette.textSecondary }}>
              Placed: {order.time}
            </Text>

            <View className="mt-4" style={{ borderTopWidth: 1, borderTopColor: palette.border }}>
              {order.items.map((item) => (
                <View key={item.name} className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
                  <Text className="text-[15px]" style={{ color: palette.textPrimary }}>
                    {item.name}
                  </Text>
                  <Text className="text-[15px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                    x{item.qty}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                Total
              </Text>
              <Text className="text-[20px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                {order.total}
              </Text>
            </View>
          </View>
        ) : (
          <View className="rounded-3xl p-5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
            <Text style={{ color: palette.textSecondary }}>Order not found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
