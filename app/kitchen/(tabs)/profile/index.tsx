import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { persistThemePreference, setThemeMode } from "@/redux/theme/theme.slice";
import {
  selectKitchenProfile,
  selectKitchenProfileStatus,
} from "@/redux/kitchen/kitchen.selectors";
import { fetchKitchenProfile } from "@/redux/kitchen/kitchen.thunks";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { logout } from "@/redux/auth/auth.thunks";

type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route?: string;
  badge?: string;
  onPress?: () => void;
};

function Row({ item, isDark }: { item: SettingsRow; isDark: boolean }) {
  const palette = getKitchenPalette(isDark);

  const onPress = () => {
    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.route) router.push(item.route as any);
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      style={{ borderTopWidth: 1, borderTopColor: palette.border }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: isDark ? palette.elevated : "#FFF3DF" }}
      >
        <Ionicons name={item.icon} size={20} color={palette.accentStrong} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }}>
          {item.title}
        </Text>
        <Text className="text-[14px] mt-0.5" style={{ color: palette.textSecondary }}>
          {item.subtitle}
        </Text>
      </View>

      {item.badge ? (
        <View className="rounded-full px-2 py-1 mr-2" style={{ backgroundColor: palette.accent }}>
          <Text className="text-[10px] text-white font-satoshiBold">{item.badge}</Text>
        </View>
      ) : null}

      <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
    </Pressable>
  );
}

export default function KitchenProfileScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const kitchen = useAppSelector(selectKitchenProfile);
  const kitchenStatus = useAppSelector(selectKitchenProfileStatus);

  useEffect(() => {
    if (!kitchen && kitchenStatus !== "loading") {
      dispatch(fetchKitchenProfile());
    }
  }, [dispatch, kitchen, kitchenStatus]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  const doLogout = async () => {
    await dispatch(logout()).unwrap();
    router.replace("/(auth)/login");
  };

  const profileName = kitchen?.name || "Gourmet Kitchen Central";
  const profileId = kitchen?.id ? `vendor_id: #${kitchen.id.slice(0, 6)}` : "vendor_id: #882910";

  const storeRows: SettingsRow[] = [
    {
      icon: "time",
      title: "Business Hours",
      subtitle: `${kitchen?.opening_time || "08:00 AM"} - ${kitchen?.closing_time || "10:00 PM"}`,
      route: "/kitchen/(tabs)/settings",
    },
    {
      icon: "timer",
      title: "Avg. Preparation Time",
      subtitle: kitchen?.preparation_time || "15 - 25 minutes",
      route: "/kitchen/(tabs)/settings",
    },
    {
      icon: "car",
      title: "Location & Fares",
      subtitle: "Manage delivery radius & pricing",
      route: "/kitchen/(tabs)/settings",
    },
  ];

  const financeRows: SettingsRow[] = [
    {
      icon: "wallet",
      title: "Wallet Security",
      subtitle: "Change finance password",
      route: "/kitchen/profile/wallet-password",
    },
    {
      icon: "storefront",
      title: "Manage Outlets",
      subtitle: "Add or switch between outlets",
      route: "/kitchen/profile/outlets",
      badge: "NEW",
    },
  ];

  const insightRows: SettingsRow[] = [
    {
      icon: "star",
      title: "Reviews",
      subtitle: "4.8 Average Rating",
      route: "/kitchen/profile/reviews",
    },
    {
      icon: "bar-chart",
      title: "Business Metrics",
      subtitle: "Growth and performance reports",
      route: "/kitchen/profile/metrics",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[22px] leading-[30px] font-satoshiBold"
            style={{ color: palette.textPrimary }}
          >
            Profile & Settings
          </Text>

          <View className="flex-row items-center">
            <Pressable
              onPress={toggleTheme}
              className="w-12 h-12 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={palette.textSecondary} />
            </Pressable>

            <Pressable
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Ionicons name="notifications" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View
          className="rounded-[30px] p-6 mt-6"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          {kitchenStatus === "loading" && !kitchen ? (
            <View className="items-center py-5">
              <ActivityIndicator color={palette.accent} />
            </View>
          ) : (
            <>
              <View className="items-center">
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? palette.elevated : "#FFDDBB" }}
                >
                  <Ionicons name="person" size={56} color={palette.accentStrong} />

                  <Pressable
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: palette.accent }}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                  </Pressable>
                </View>

                <Text
                  className="mt-4 text-[16px] leading-[22px] font-satoshiBold text-center"
                  style={{ color: palette.textPrimary }}
                >
                  {profileName}
                </Text>
                <Text className="text-[17px] mt-1" style={{ color: palette.textSecondary }}>
                  {profileId}
                </Text>
              </View>

              <View className="mt-6 flex-row">
                <Pressable
                  onPress={() => router.push("/kitchen/profile/qr")}
                  className="flex-1 mr-2 rounded-2xl py-4 items-center justify-center"
                  style={{ backgroundColor: palette.accent }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code" size={18} color="#fff" />
                    <Text className="ml-2 text-white font-satoshiBold text-[15px]">Share QR</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/kitchen/(tabs)/settings")}
                  className="flex-1 ml-2 rounded-2xl py-4 items-center justify-center"
                  style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.elevated }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="create" size={18} color={palette.accentStrong} />
                    <Text
                      className="ml-2 font-satoshiBold text-[15px]"
                      style={{ color: palette.accentStrong }}
                    >
                      Edit Profile
                    </Text>
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </View>

        <Text className="mt-8 mb-2 text-[13px] tracking-[2px] font-satoshiBold" style={{ color: palette.textMuted }}>
          STORE MANAGEMENT
        </Text>
        <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          {storeRows.map((item) => (
            <Row key={item.title} item={item} isDark={isDark} />
          ))}
        </View>

        <Text className="mt-8 mb-2 text-[13px] tracking-[2px] font-satoshiBold" style={{ color: palette.textMuted }}>
          FINANCE & SECURITY
        </Text>
        <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          {financeRows.map((item) => (
            <Row key={item.title} item={item} isDark={isDark} />
          ))}

          <View className="flex-row items-center justify-between px-4 py-4" style={{ borderTopWidth: 1, borderTopColor: palette.border }}>
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: isDark ? palette.elevated : "#FFF3DF" }}
              >
                <Ionicons name="moon" size={20} color={palette.accentStrong} />
              </View>

              <View className="ml-4">
                <Text className="text-[16px] font-satoshiBold" style={{ color: palette.textPrimary }}>
                  Dark Mode
                </Text>
                <Text className="text-[14px] mt-0.5" style={{ color: palette.textSecondary }}>
                  Use low-light kitchen theme
                </Text>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={isDark ? palette.accent : "#F9FAFB"}
              trackColor={{ false: "#D4D9E1", true: isDark ? "#5F4A12" : "#FBD38D" }}
              ios_backgroundColor="#D4D9E1"
            />
          </View>
        </View>

        <Text className="mt-8 mb-2 text-[13px] tracking-[2px] font-satoshiBold" style={{ color: palette.textMuted }}>
          FEEDBACK & INSIGHTS
        </Text>
        <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          {insightRows.map((item) => (
            <Row key={item.title} item={item} isDark={isDark} />
          ))}
        </View>

        <Pressable
          onPress={doLogout}
          className="mt-8 rounded-3xl py-4 items-center justify-center"
          style={{
            borderWidth: 2,
            borderColor: isDark ? "#713146" : "#F9CDD8",
            backgroundColor: isDark ? "#2D1320" : "transparent",
          }}
        >
          <Text className="text-[15px] font-satoshiBold" style={{ color: "#F43F5E" }}>
            Logout Account
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
