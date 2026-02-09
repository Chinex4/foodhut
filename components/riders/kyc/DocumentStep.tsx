// components/riders/kyc/DocumentsStep.tsx
import React from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { ID_TYPES, SimpleSelect } from "./sharedSelect";
import { UploadFile } from "./kycTypes";

type Props = {
  idType: string | null;
  setIdType: (v: string | null) => void;
  idNumber: string;
  setIdNumber: (v: string) => void;
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  isDark: boolean;
};

export default function DocumentsStep({
  idType,
  setIdType,
  idNumber,
  setIdNumber,
  files,
  setFiles,
  isDark,
}: Props) {
  const canAddMore = files.length < 2;

  const handlePickImages = async () => {
    if (!canAddMore) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photos to upload your ID card."
      );
      return;
    }

    const remaining = 2 - files.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });

    if (result.canceled) return;

    const picked: UploadFile[] = result.assets.slice(0, remaining).map((a) => {
      const sizeKb =
        typeof a.fileSize === "number"
          ? `${Math.round(a.fileSize / 1024)} KB`
          : "— KB";

      return {
        id: `${Date.now()}-${a.assetId ?? a.uri}`,
        uri: a.uri,
        name: idType || a.fileName || "ID Card",
        sizeLabel: sizeKb,
      };
    });

    setFiles([...files, ...picked]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <View className="mt-4">
      <Text className={`text-sm font-satoshiMedium mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        ID Type
      </Text>
      <SimpleSelect
        placeholder="Select ID Type"
        value={idType}
        options={ID_TYPES}
        onChange={setIdType}
        isDark={isDark}
      />

      <Text className={`text-sm font-satoshiMedium mt-6 mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        ID Number
      </Text>
      <TextInput
        value={idNumber}
        onChangeText={setIdNumber}
        placeholder="Enter ID Number"
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className={`rounded-2xl px-4 py-3 font-satoshi text-base mb-5 ${
          isDark ? "bg-neutral-900 text-white" : "bg-[#ececec] text-black"
        }`}
      />

      <Text className={`text-sm font-satoshiMedium mb-2 ${isDark ? "text-neutral-200" : "text-black"}`}>
        Upload Document
      </Text>

      <Pressable
        disabled={!canAddMore}
        onPress={handlePickImages}
        className={`rounded-3xl border-2 border-dashed px-4 py-6 items-center ${
          canAddMore
            ? "border-primary"
            : isDark
              ? "border-neutral-700 opacity-60"
              : "border-gray-300 opacity-60"
        }`}
      >
        <Text className={`text-sm font-satoshi mb-4 ${isDark ? "text-neutral-300" : "text-gray-700"}`}>
          Drag and drop pictures here
        </Text>
        <View className="px-6 py-2 rounded-2xl bg-primary">
          <Text className="text-white font-satoshiMedium text-sm">
            Upload File
          </Text>
        </View>
        <Text className={`text-xs font-satoshi mt-3 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>
          Maximum Of 2 Pictures
        </Text>
      </Pressable>

      <View className="mt-4">
        {files.map((file) => (
          <View
            key={file.id}
            className={`flex-row rounded-3xl px-4 py-3 mb-3 items-center ${
              isDark ? "bg-neutral-900" : "bg-white"
            }`}
          >
            <View className="w-12 h-12 rounded-xl overflow-hidden mr-3 bg-gray-200">
              <Image
                source={{ uri: file.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className={`text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>
                {file.name}
              </Text>
              <Text className={`text-xs font-satoshi mb-1 ${isDark ? "text-neutral-500" : "text-gray-500"}`}>
                {file.sizeLabel}
              </Text>
              <Text className="text-xs font-satoshi text-primary">
                Tap preview above to view full image
              </Text>
            </View>

            <Pressable onPress={() => removeFile(file.id)}>
              <Ionicons name="trash-outline" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
