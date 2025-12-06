import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { showError, showSuccess } from "@/components/ui/toast";
import { logout } from "@/redux/auth/auth.thunks";
import { selectFetchMeStatus, selectMe, selectUploadPicStatus } from "@/redux/users/users.selectors";
import { uploadProfilePicture } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CachedImage from "@/components/ui/CachedImage";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { persistThemePreference, setThemeMode } from "@/redux/theme/theme.slice";

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
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
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

export default function ProfileHomeScreen() {
  const router = useRouter();
  const me = useAppSelector(selectMe);
  const fetchMe = useAppSelector(selectFetchMeStatus);
  const uploadPicStatus = useAppSelector(selectUploadPicStatus);
  const themeMode = useAppSelector(selectThemeMode);
  const isDark = themeMode === "dark";
  const dispatch = useAppDispatch();

  const fullName =
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") || "—";

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/(auth)/login");
    } catch (error) {
      // err handled in thunk
    }
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    dispatch(setThemeMode(next));
    dispatch(persistThemePreference(next));
  };

  const handleUploadProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = asset.uri.split("/").pop() || "avatar.jpg";
        
        await dispatch(
          uploadProfilePicture({
            uri: asset.uri,
            name: fileName,
            type: asset.type || "image/jpeg",
          })
        ).unwrap();
        
        showSuccess("Profile picture updated successfully!");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to upload picture");
    }
  };
  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header / Hero */}
      <View
        className={`px-5 pb-5 pt-24 ${
          isDark ? "bg-neutral-900" : "bg-primary-500"
        }`}
      >
        <View className="items-center">
          <View className="relative">
            <CachedImage
              uri={me?.profile_picture.url}
              fallback={
                <Image
                  source={require("@/assets/images/avatar.png")}
                  className="w-24 h-24 rounded-full bg-neutral-200"
                />
              }
              className="w-24 h-24 rounded-full bg-neutral-200"
            />
            <Pressable
              onPress={handleUploadProfilePicture}
              disabled={uploadPicStatus === "loading"}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-white"
            >
              {uploadPicStatus === "loading" ? (
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
            {fetchMe === "loading" ? "Loading..." : fullName}
          </Text>

          {/* CTA buttons */}
          <View className="flex-row mt-4">
            <Pressable
              onPress={() => {}}
              className="bg-primary rounded-full px-4 py-2 mr-3 items-center justify-center border border-primary-500"
            >
              <View className="flex-row items-center">
                <Ionicons name="bag-outline" size={16} color="#fff" />
                <Text className="ml-2 text-white font-satoshiMedium">
                  Place Order
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/users/wallet" as any)}
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
          
          {/* Kitchen Dashboard Button */}
          <View className="flex-col mt-4 gap-4">
            {me?.has_kitchen ? (
              <Pressable
                onPress={() => router.push("/users/kitchenDashboard" as any)}
                className="bg-primary rounded-full px-4 py-2 items-center justify-center border border-primary-500"
              >
                <View className="flex-row items-center">
                  <Ionicons name="storefront-outline" size={16} color="#fff" />
                  <Text className="ml-2 text-white font-satoshiMedium">
                    Visit Kitchen Dashboard
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/users/kitchen/create" as any)}
                className="bg-primary rounded-full px-4 py-2 items-center justify-center border border-primary-500"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={16} color="#fff" />
                  <Text className="ml-2 text-white font-satoshiMedium">
                    Become a Kitchen
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Personal */}
        <Text
          className={`font-satoshi px-1 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          Personal
        </Text>
        <Row
          icon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
          label="Personal Details"
          onPress={() => router.push("/users/profile/details")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="location-outline" size={18} color="#9CA3AF" />}
          label="Addresses"
          onPress={() => {}}
          isDark={isDark}
        />

        {/* Rewards & perks */}
        <Text
          className={`font-satoshi px-1 mt-4 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          Rewards & perks
        </Text>
        <Row
          icon={
            <Ionicons name="share-social-outline" size={18} color="#9CA3AF" />
          }
          label="Referrals"
          onPress={() => router.push("/users/rewards")}
          isDark={isDark}
        />
        <Row
          icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}
          label="Gift Cards"
          onPress={() => router.push("/users/profile/gift-cards")}
          isDark={isDark}
        />

        {/* App */}
        <Text
          className={`font-satoshi px-1 mt-4 mb-2 ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          App
        </Text>
        <Row
          icon={<Ionicons name="sparkles-outline" size={18} color="#9CA3AF" />}
          label="What’s New"
          onPress={() => router.push("/users/profile/whats-new")}
          isDark={isDark}
        />
        <Row
          icon={
            <Ionicons name="help-circle-outline" size={18} color="#9CA3AF" />
          }
          label="FAQ’s"
          onPress={() => router.push("/users/profile/faqs")}
          isDark={isDark}
        />
        <Row
          icon={
            <Ionicons name="chatbubbles-outline" size={18} color="#9CA3AF" />
          }
          label="Get Help"
          onPress={() => router.push("/users/profile/get-help")}
          isDark={isDark}
        />
        <Row
          icon={
            <Ionicons name="document-text-outline" size={18} color="#9CA3AF" />
          }
          label="Legal"
          onPress={() => router.push("/users/profile/legal")}
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

        {/* Danger / sign out */}
        <Row
          icon={<Ionicons name="log-out-outline" size={18} color="#DC2626" />}
          label="Sign Out"
          danger
          onPress={handleLogout}
          isDark={isDark}
        />
      </ScrollView>
    </View>
  );
}
