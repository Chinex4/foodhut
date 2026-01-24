import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { showError, showSuccess } from "@/components/ui/toast";
import { logout } from "@/redux/auth/auth.thunks";
import { selectMe } from "@/redux/users/users.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  persistThemePreference,
  setThemeMode,
} from "@/redux/theme/theme.slice";
import { useEnsureAuthenticated } from "@/hooks/useEnsureAuthenticated";

function Row({
  icon,
  label,
  onPress,
  danger = false,
  rightIcon,
  isDark = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  rightIcon?: React.ReactNode;
  isDark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-4 rounded-2xl mb-3 border ${
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-white border-neutral-100"
      }`}
      android_ripple={{ color: isDark ? "#2d2d2d" : "#eee" }}
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
      {rightIcon ?? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={danger ? "#DC2626" : isDark ? "#9CA3AF" : "#9CA3AF"}
        />
      )}
    </Pressable>
  );
}

export default function RiderProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectMe);
  const themeMode = useAppSelector(selectThemeMode);
  const isDark = themeMode === "dark";
  const { isAuthenticated, redirectToLogin } = useEnsureAuthenticated();

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin]);

  const fullName =
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") || "Rider";

  const profileSource = useMemo(() => {
    if (localImageUri) return { uri: localImageUri };
    if (me?.profile_picture?.url) return { uri: me.profile_picture.url };
    return require("@/assets/images/avatar.png");
  }, [localImageUri, me?.profile_picture?.url]);

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
      // errors handled in thunk
    }
  };

  const handlePickProfilePicture = async () => {
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setLocalImageUri(result.assets[0].uri);
        showSuccess("Profile picture updated");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to pick image");
    } finally {
      setPicking(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        className={`px-5 pb-5 pt-24 ${
          isDark ? "bg-neutral-900" : "bg-primary-500"
        }`}
      >
        <View className="items-center">
          <View className="relative">
            <Image
              source={profileSource}
              className="w-24 h-24 rounded-full bg-neutral-200"
            />
            <Pressable
              onPress={handlePickProfilePicture}
              disabled={picking}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-white"
            >
              {picking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
          <Text
            className={`mt-3 text-[18px] font-satoshiBold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            {fullName}
          </Text>
          <Text className="mt-1 text-white/80 font-satoshi">
            Rider account
          </Text>

          <View className="flex-row mt-4">
            <Pressable
              onPress={() => router.push("/riders/wallet")}
              className="bg-white rounded-full px-4 py-2 items-center justify-center border border-neutral-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={16} color="#0F172A" />
                <Text className="ml-2 text-neutral-900 font-satoshiMedium">
                  View Wallet
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <Text
          className={`font-satoshi px-1 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          Rider
        </Text>
        <Row
          icon={<Ionicons name="bicycle-outline" size={18} color="#9CA3AF" />}
          label="Ride History"
          onPress={() => router.push("/riders/(tabs)/rides")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" />}
          label="Safety Toolkit"
          onPress={() => showSuccess("Safety toolkit coming soon")}
          isDark={isDark}
        />

        <Text
          className={`font-satoshi px-1 mt-4 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          Account
        </Text>
        <Row
          icon={<Ionicons name="swap-horizontal-outline" size={18} color="#9CA3AF" />}
          label="Switch to User Dashboard"
          onPress={() => router.replace("/users/(tabs)/index")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="moon-outline" size={18} color="#9CA3AF" />}
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

        <Text
          className={`font-satoshi px-1 mt-4 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          App
        </Text>
        <Row
          icon={<Ionicons name="help-circle-outline" size={18} color="#9CA3AF" />}
          label="Get Help"
          onPress={() => router.push("/users/profile/get-help")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="document-text-outline" size={18} color="#9CA3AF" />}
          label="Legal"
          onPress={() => router.push("/users/profile/legal")}
          isDark={isDark}
        />

        <Row
          icon={<Ionicons name="log-out-outline" size={18} color="#DC2626" />}
          label="Log Out"
          danger
          onPress={handleLogout}
          isDark={isDark}
        />
      </ScrollView>
    </View>
  );
}
