import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { logout } from "@/redux/auth/auth.thunks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  mockRiderProfile,
  mockRiderWallet,
} from "@/utils/mock/mockRider";
import {
  persistThemePreference,
  setThemeMode,
} from "@/redux/theme/theme.slice";

function Row({
  icon,
  label,
  onPress,
  rightText,
  rightIcon,
  danger = false,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightText?: string;
  rightIcon?: React.ReactNode;
  danger?: boolean;
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
        <Text
          className={`ml-3 text-[14px] font-satoshi ${
            danger
              ? "text-red-600"
              : isDark
                ? "text-neutral-100"
                : "text-neutral-900"
          }`}
        >
          {label}
        </Text>
      </View>
      {rightIcon ??
        (rightText ? (
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {rightText}
          </Text>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={danger ? "#DC2626" : isDark ? "#9CA3AF" : "#9CA3AF"}
          />
        ))}
    </Pressable>
  );
}

export default function RiderProfileScreen() {
  const router = useRouter();
  const themeMode = useAppSelector(selectThemeMode);
  const isDark = themeMode === "dark";
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [online, setOnline] = useState(true);

  const profile = useMemo(() => mockRiderProfile, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/(auth)/login");
    } catch {
      // handled in thunk
    }
  };

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200">
            <Image
              source={
                profile.avatar
                  ? { uri: profile.avatar }
                  : require("@/assets/images/avatar.png")
              }
              className="w-full h-full"
            />
          </View>
          <Text
            className={`mt-3 text-[18px] font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            {profile.name}
          </Text>
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {profile.email} • {profile.phone}
          </Text>
        </View>

        <View
          className={`rounded-2xl p-4 mb-4 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Wallet Balance
          </Text>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {mockRiderWallet.balance}
          </Text>
          <View className="flex-row items-center justify-between mt-3">
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Daily Cash
            </Text>
            <Text className={`text-[12px] font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
              {mockRiderWallet.dailyCash}
            </Text>
          </View>
        </View>

        <Row
          icon={<Ionicons name="person-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="Edit Profile"
          onPress={() => router.push("/riders/profile/edit")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="shield-checkmark-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="KYC"
          rightText={profile.kycStatus}
          onPress={() => router.push("/riders/profile/kyc")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="star-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="Reviews"
          onPress={() => router.push("/riders/profile/reviews")}
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
              thumbColor={isDark ? "#F59E0B" : "#f5f5f5"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
          }
          isDark={isDark}
        />

        <View
          className={`rounded-2xl px-4 py-4 mt-2 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <Text className={`${isDark ? "text-neutral-200" : "text-neutral-800"} font-satoshiMedium`}>
              Online Status
            </Text>
            <Switch
              value={online}
              onValueChange={setOnline}
              thumbColor={online ? "#F59E0B" : "#9CA3AF"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
          </View>
        </View>

        {isAuthenticated && (
          <Row
            icon={<Ionicons name="log-out-outline" size={18} color="#DC2626" />}
            label="Sign Out"
            danger
            onPress={handleLogout}
            isDark={isDark}
          />
        )}
      </ScrollView>
    </View>
  );
}
