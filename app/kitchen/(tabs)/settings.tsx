import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import SettingsTab from "@/app/kitchen/components/SettingsTab";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { useAppDispatch } from "@/store/hooks";
import {
  updateKitchenByProfile,
} from "@/redux/kitchen/kitchen.thunks";
import { showError, showSuccess } from "@/components/ui/toast";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

export default function KitchenSettingsScreen() {
  const dispatch = useAppDispatch();
  const { isDark, kitchen, kitchenStatus } = useKitchenData();
  const palette = getKitchenPalette(isDark);

  const [closingTime, setClosingTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (kitchen) {
      setClosingTime(kitchen.closing_time || "");
      setIsAvailable(Boolean(kitchen.is_available));
    }
  }, [kitchen]);

  const handleUpdateCover = async () => {
    showError("Cover image updates are not supported by this endpoint yet");
  };

  const handleUpdateProfilePic = async () => {
    showError("Profile picture updates are not supported by this endpoint yet");
  };

  const handleSave = async () => {
    if (!kitchen) return;
    setSaving(true);
    try {
      await dispatch(
        updateKitchenByProfile({
          closing_time: closingTime.trim(),
          is_available: isAvailable,
        })
      ).unwrap();
      showSuccess("Kitchen updated");
    } catch (err: any) {
      showError(err?.message || "Failed to update kitchen");
    } finally {
      setSaving(false);
    }
  };

  if (kitchenStatus === "loading" && !kitchen) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SettingsTab
        kitchen={kitchen}
        isDark={isDark}
        closingTime={closingTime}
        isAvailable={isAvailable}
        onChangeClosingTime={setClosingTime}
        onChangeAvailable={setIsAvailable}
        onUpdateCover={handleUpdateCover}
        onUpdateProfilePic={handleUpdateProfilePic}
        onSave={handleSave}
        saving={saving}
      />
    </SafeAreaView>
  );
}
