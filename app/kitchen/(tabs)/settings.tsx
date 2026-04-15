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
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function KitchenSettingsScreen() {
  const dispatch = useAppDispatch();
  const { isDark, kitchen, kitchenStatus } = useKitchenData();
  const palette = getKitchenPalette(isDark);

  const [kitchenName, setKitchenName] = useState("");
  const [kitchenPhone, setKitchenPhone] = useState("");
  const [kitchenAddress, setKitchenAddress] = useState("");
  const { uploadImage, isUploading } = useImageUpload();
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
      const storageId = await uploadImage({
        uri: asset.uri,
        name: asset.fileName ?? "cover.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      if (storageId) {
        await dispatch(updateKitchenByProfile({ cover_image_id: storageId })).unwrap();
        showSuccess("Cover updated");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to update cover");
    }
  };

  const handleUpdateProfilePic = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      const storageId = await uploadImage({
        uri: asset.uri,
        name: asset.fileName ?? "profile.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      if (storageId) {
        await dispatch(updateKitchenByProfile({ profile_picture_id: storageId })).unwrap();
        showSuccess("Profile picture updated");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to update profile picture");
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
          closing_time: kitchen.closing_time,
          is_available: kitchen.is_available,
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
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
        onUpdateProfilePic={handleUpdateProfilePic}
        onSave={handleSave}
        saving={saving || isUploading}
      />
    </View>
  );
}
