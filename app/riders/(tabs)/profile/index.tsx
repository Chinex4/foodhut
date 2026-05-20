import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { logout } from "@/redux/auth/auth.thunks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import {
  fetchRiderProfile,
  updateRiderStatus,
} from "@/redux/logistics/logistics.thunks";
import {
  selectLogisticsMutationStatus,
  selectRiderProfile,
} from "@/redux/logistics/logistics.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  persistThemePreference,
  setThemeMode,
} from "@/redux/theme/theme.slice";
import {
  selectFetchMeStatus,
  selectMe,
  selectUploadPicStatus,
} from "@/redux/users/users.selectors";
import {
  fetchMyProfile,
  uploadProfilePicture,
} from "@/redux/users/users.thunks";
import { selectWalletBalanceNumber, selectWalletProfileStatus } from "@/redux/wallet/wallet.selectors";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { showError, showSuccess } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveLastDashboard } from "@/storage/dashboard";
import { formatNGN } from "@/utils/money";

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
  const me = useAppSelector(selectMe);
  const fetchMeStatus = useAppSelector(selectFetchMeStatus);
  const riderProfile = useAppSelector(selectRiderProfile);
  const mutationStatus = useAppSelector(selectLogisticsMutationStatus);
  const walletStatus = useAppSelector(selectWalletProfileStatus);
  const walletBalance = useAppSelector(selectWalletBalanceNumber);
  const uploadPicStatus = useAppSelector(selectUploadPicStatus);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!me && fetchMeStatus !== "loading") dispatch(fetchMyProfile());
    dispatch(fetchRiderProfile());
    if (walletStatus === "idle") dispatch(fetchWalletProfile({ as_rider: true }));
  }, [dispatch, fetchMeStatus, me, walletStatus]);

  useEffect(() => {
    setOnline(Boolean(riderProfile?.is_available));
  }, [riderProfile?.is_available]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  const toggleOnline = async (value: boolean) => {
    setOnline(value);
    if (!riderProfile?.id) {
      showError("Create your rider profile before going online.");
      return;
    }
    try {
      await dispatch(
        updateRiderStatus({
          rider_id: riderProfile.id,
          is_available: value,
          is_blocked: riderProfile.is_blocked,
        })
      ).unwrap();
      showSuccess(value ? "You are online." : "You are offline.");
    } catch (error: any) {
      setOnline(Boolean(riderProfile.is_available));
      showError(error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/(auth)/login");
    } catch {
      // handled in thunk
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop() || "rider-avatar.jpg";

      await dispatch(
        uploadProfilePicture({
          uri: asset.uri,
          name: fileName,
          type: asset.type || "image/jpeg",
        })
      ).unwrap();

      showSuccess("Profile picture updated.");
    } catch (error: any) {
      showError(error?.message || error || "Failed to upload picture");
    }
  };

  const name = [me?.first_name, me?.last_name].filter(Boolean).join(" ").trim() || "Rider";
  const kycStatus = riderProfile?.kyc?.verification_status ?? "PENDING";

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center mb-6">
          <View className="relative">
            <Image
              source={
                me?.profile_picture?.url
                  ? { uri: me.profile_picture.url }
                  : require("@/assets/images/avatar.png")
              }
              className="w-24 h-24 rounded-full bg-neutral-200"
            />
            <Pressable
              onPress={handleUploadProfilePicture}
              disabled={uploadPicStatus === "loading" || !isAuthenticated}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-white"
            >
              {uploadPicStatus === "loading" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
          <Text className={`mt-3 text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            {name}
          </Text>
          <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {me?.email || "No email"} • {me?.phone_number || "No phone"}
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
            {formatNGN(walletBalance)}
          </Text>
          <View className="flex-row items-center justify-between mt-3">
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Rider Status
            </Text>
            <Text className={`text-[12px] font-satoshiMedium ${online ? "text-emerald-500" : isDark ? "text-neutral-200" : "text-neutral-700"}`}>
              {online ? "Online" : "Offline"}
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
          icon={<Ionicons name="wallet-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="Wallet"
          rightText={formatNGN(walletBalance)}
          onPress={() => router.push("/riders/wallet")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="shield-checkmark-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="KYC"
          rightText={kycStatus}
          onPress={() => router.push("/riders/profile/kyc")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="person-circle-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />}
          label="Switch to User Dashboard"
          onPress={async () => {
            await saveLastDashboard("users");
            router.replace("/users/(tabs)");
          }}
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
          className={`rounded-2xl px-4 py-4 mt-2 mb-3 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <Text className={`${isDark ? "text-neutral-200" : "text-neutral-800"} font-satoshiMedium`}>
              Online Status
            </Text>
            {mutationStatus === "loading" ? (
              <ActivityIndicator color="#F59E0B" />
            ) : (
              <Switch
                value={online}
                onValueChange={toggleOnline}
                thumbColor={online ? "#F59E0B" : "#9CA3AF"}
                trackColor={{ false: "#d1d5db", true: "#92400e" }}
              />
            )}
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
