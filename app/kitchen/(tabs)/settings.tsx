import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

import SettingsTab from "@/app/kitchen/components/SettingsTab";
import { useKitchenData } from "@/app/kitchen/hooks/useKitchenData";
import { useAppDispatch } from "@/store/hooks";
import {
  updateKitchenByProfile,
  uploadKitchenCoverByProfile,
} from "@/redux/kitchen/kitchen.thunks";
import { showError, showSuccess } from "@/components/ui/toast";

export default function KitchenSettingsScreen() {
  const dispatch = useAppDispatch();
  const { isDark, kitchen, kitchenStatus } = useKitchenData();

  const [kitchenName, setKitchenName] = useState("");
  const [kitchenPhone, setKitchenPhone] = useState("");
  const [kitchenAddress, setKitchenAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (kitchen) {
      setKitchenName(kitchen.name || "");
      setKitchenPhone(kitchen.phone_number || "");
      setKitchenAddress(kitchen.address || "");
    }
  }, [kitchen]);

  const handleUpdateCover = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      await dispatch(
        uploadKitchenCoverByProfile({
          uri: asset.uri,
          name: asset.fileName ?? "cover.jpg",
          type: asset.type ?? "image/jpeg",
        })
      ).unwrap();
      showSuccess("Cover updated");
    } catch (err: any) {
      showError(err?.message || "Failed to upload cover");
    }
  };

  const handleSave = async () => {
    if (!kitchen) return;
    setSaving(true);
    try {
      await dispatch(
        updateKitchenByProfile({
          name: kitchenName.trim(),
          phone_number: kitchenPhone.trim(),
          address: kitchenAddress.trim(),
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
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-white"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color="#F59E0B" />
      </View>
    );
  }

  return (
    <View className={`flex-1 pt-16 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SettingsTab
        kitchen={kitchen}
        isDark={isDark}
        kitchenName={kitchenName}
        kitchenPhone={kitchenPhone}
        kitchenAddress={kitchenAddress}
        onChangeName={setKitchenName}
        onChangePhone={setKitchenPhone}
        onChangeAddress={setKitchenAddress}
        onUpdateCover={handleUpdateCover}
        onSave={handleSave}
        saving={saving}
      />
    </View>
  );
}
