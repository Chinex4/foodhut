import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showError, showSuccess } from "@/components/ui/toast";
import { logout } from "@/redux/auth/auth.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
    selectDeleteMeStatus,
    selectMe,
    selectUpdateMeStatus,
} from "@/redux/users/users.selectors";
import { deleteMyProfile, updateMyProfile } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function Field({
  icon,
  value,
  onChangeText,
  placeholder,
  editable = true,
  rightEl,
  isDark,
}: {
  icon: React.ReactNode;
  value?: string | null;
  onChangeText?: (t: string) => void;
  placeholder: string;
  editable?: boolean;
  rightEl?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View className={`rounded-2xl mb-3 overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-100/70"}`}>
      <View className="px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {icon}
          <TextInput
            value={value ?? ""}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={editable}
            className={`ml-3 flex-1 font-satoshi ${editable ? (isDark ? "text-white" : "text-neutral-900") : (isDark ? "text-neutral-500" : "text-neutral-400")}`}
          />
        </View>
        {rightEl}
      </View>
    </View>
  );
}

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const me = useAppSelector(selectMe);
  const updating = useAppSelector(selectUpdateMeStatus) === "loading";
  const deleting = useAppSelector(selectDeleteMeStatus) === "loading";

  // name is the only editable field per your UpdateUserPayload
  const [firstName, setFirstName] = useState(me?.first_name ?? "");
  const [lastName, setLastName] = useState(me?.last_name ?? "");

  const canSave = useMemo(() => {
    return (
      !updating &&
      ((firstName ?? "") !== (me?.first_name ?? "") ||
        (lastName ?? "") !== (me?.last_name ?? ""))
    );
  }, [firstName, lastName, me, updating]);

  const onSave = async () => {
    try {
      await dispatch(
        updateMyProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
      ).unwrap();
      showSuccess("Profile updated");
    } catch (e: any) {
      showError(e);
    }
  };

  const onDelete = async () => {
    try {
      await dispatch(deleteMyProfile()).unwrap();
      showSuccess("Account deleted");
      router.replace("/(auth)/login");
    } catch (e: any) {
      showError(e);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/(auth)/login");
    } catch (error) {
      // err handled in thunk
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <View className={`px-5 pt-8 pb-2 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push("/users/(tabs)/profile")}
            className="mr-2"
          >
            <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#0F172A"} />
          </Pressable>
          <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Profile Details
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Editable name */}
        <Field
          icon={<Ionicons name="person-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />}
          value={`${firstName} ${lastName}`.trim()}
          onChangeText={(t) => {
            const parts = t.split(" ");
            setFirstName(parts[0] ?? "");
            setLastName(parts.slice(1).join(" "));
          }}
          placeholder="Account name"
          rightEl={<Ionicons name="create-outline" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />}
          isDark={isDark}
        />

        {/* Phone - read only per your API types */}
        <Field
          icon={<Ionicons name="call-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />}
          value={me?.phone_number ?? ""}
          placeholder="Phone number"
          editable={false}
          rightEl={<Ionicons name="create-outline" size={16} color={isDark ? "#6B7280" : "#E5E7EB"} />}
          isDark={isDark}
        />

        {/* Email - read only */}
        <Field
          icon={<Ionicons name="mail-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />}
          value={me?.email ?? ""}
          placeholder="Email"
          editable={false}
          rightEl={<Iconicons name="create-outline" size={16} color={isDark ? "#6B7280" : "#E5E7EB"} />}
          isDark={isDark}
        />

        {/* Date of birth (display only – API doesn't allow update in your types) */}
        <Field
          icon={<Ionicons name="calendar-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />}
          value={me?.birthday ?? ""}
          placeholder="Date of birth"
          editable={false}
          rightEl={<Ionicons name="calendar" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />}
          isDark={isDark}
        />

        {/* Save button */}
        <Pressable
          disabled={!canSave}
          onPress={onSave}
          className={`mt-4 rounded-2xl py-4 items-center justify-center ${
            canSave ? "bg-primary" : isDark ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        >
          <Text className="text-white font-satoshiBold">
            {updating ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>

        {/* Divider */}
        <View className={`h-[1px] my-6 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`} />

        {/* Danger actions */}
        <Pressable
          onPress={() => handleLogout()}
          className={`flex-row items-center justify-between px-4 py-4 rounded-2xl mb-3 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={18} color={isDark ? "#9CA3AF" : "#0F172A"} />
            <Text className={`ml-3 text-[14px] font-satoshi ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
              Sign out
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#9CA3AF"} />
        </Pressable>

        <Pressable
          onPress={onDelete}
          className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
        >
          <View className="flex-row items-center">
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text className="ml-3 text-[14px] font-satoshi text-red-600">
              Delete account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
