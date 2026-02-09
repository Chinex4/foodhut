import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { mockVendorSummary } from "@/utils/mock/mockVendor";
import { persistThemePreference, setThemeMode } from "@/redux/theme/theme.slice";

function Row({
  icon,
  label,
  onPress,
  rightIcon,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-4 rounded-2xl mb-3 border ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
      }`}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className={`ml-3 text-[14px] font-satoshi ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
          {label}
        </Text>
      </View>
      {rightIcon ?? (
        <Ionicons name="chevron-forward" size={18} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
      )}
    </Pressable>
  );
}

export default function KitchenProfileScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const [kitchenName, setKitchenName] = useState("Mama Ada Kitchen");
  const [address, setAddress] = useState("12 Market Street, Lagos");
  const [contact, setContact] = useState("+234 701 234 5678");
  const [prepTime, setPrepTime] = useState("25-35 mins");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [serviceAreas, setServiceAreas] = useState("Ikoyi, VI, Lekki");

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Profile & Settings
        </Text>
        <Text className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Manage your kitchen profile.
        </Text>

        <View className={`rounded-2xl p-4 mt-4 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Wallet Balance
          </Text>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {mockVendorSummary.wallet}
          </Text>
        </View>

        {[{ label: "Kitchen name", value: kitchenName, onChange: setKitchenName },
          { label: "Address", value: address, onChange: setAddress },
          { label: "Contact", value: contact, onChange: setContact },
          { label: "Average prep time", value: prepTime, onChange: setPrepTime },
          { label: "Opening time", value: openTime, onChange: setOpenTime },
          { label: "Closing time", value: closeTime, onChange: setCloseTime },
          { label: "Service areas", value: serviceAreas, onChange: setServiceAreas }].map((field) => (
          <View key={field.label} className="mt-4">
            <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.label}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`rounded-2xl px-3 py-3 border ${isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"}`}
            />
          </View>
        ))}

        <View className="mt-5">
          <Row
            icon={<Ionicons name="star-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="Reviews"
            onPress={() => router.push("/kitchen/profile/reviews")}
            isDark={isDark}
          />
          <Row
            icon={<Ionicons name="stats-chart-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="Metrics"
            onPress={() => router.push("/kitchen/profile/metrics")}
            isDark={isDark}
          />
          <Row
            icon={<Ionicons name="qr-code-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="QR Code"
            onPress={() => router.push("/kitchen/profile/qr")}
            isDark={isDark}
          />
          <Row
            icon={<Ionicons name="storefront-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="Outlets"
            onPress={() => router.push("/kitchen/profile/outlets")}
            isDark={isDark}
          />
          <Row
            icon={<Ionicons name="moon-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="Dark Mode"
            onPress={toggleTheme}
            rightIcon={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                thumbColor={isDark ? "#F59E0B" : "#9CA3AF"}
                trackColor={{ false: "#E5E7EB", true: "#92400e" }}
                ios_backgroundColor={isDark ? "#1F2937" : "#E5E7EB"}
              />
            }
            isDark={isDark}
          />
          <Row
            icon={<Ionicons name="lock-closed-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
            label="Wallet/Finance Password"
            onPress={() => router.push("/kitchen/profile/wallet-password")}
            isDark={isDark}
          />
        </View>
      </ScrollView>
    </View>
  );
}
