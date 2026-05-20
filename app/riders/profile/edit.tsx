import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { showError, showSuccess } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectMe, selectUpdateMeStatus } from "@/redux/users/users.selectors";
import { fetchMyProfile, updateMyProfile } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function RiderEditProfileScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const me = useAppSelector(selectMe);
  const updateStatus = useAppSelector(selectUpdateMeStatus);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (!me) dispatch(fetchMyProfile());
  }, [dispatch, me]);

  useEffect(() => {
    setFirstName(me?.first_name ?? "");
    setLastName(me?.last_name ?? "");
  }, [me?.first_name, me?.last_name]);

  const save = async () => {
    try {
      if (!firstName.trim() || !lastName.trim()) {
        return showError("Enter your first and last name.");
      }
      await dispatch(
        updateMyProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
      ).unwrap();
      showSuccess("Profile updated.");
      router.back();
    } catch (error: any) {
      showError(error);
    }
  };

  const isBusy = updateStatus === "loading";

  return (
    <View className={`pt-16 flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-5 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-2">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Edit Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {[
          { label: "First name", value: firstName, onChange: setFirstName, editable: true },
          { label: "Last name", value: lastName, onChange: setLastName, editable: true },
          { label: "Email", value: me?.email ?? "", onChange: undefined, editable: false },
          { label: "Phone", value: me?.phone_number ?? "", onChange: undefined, editable: false },
        ].map((field) => (
          <View key={field.label} className="mb-4">
            <Text className={`text-[12px] mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              editable={field.editable && !isBusy}
              placeholder={field.label}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`rounded-2xl px-3 py-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
              }`}
              style={{ opacity: field.editable ? 1 : 0.7 }}
            />
          </View>
        ))}

        <Pressable
          onPress={save}
          disabled={isBusy}
          className={`rounded-2xl py-4 items-center ${isBusy ? "bg-primary/60" : "bg-primary"}`}
        >
          {isBusy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
