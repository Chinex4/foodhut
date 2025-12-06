import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAd } from "@/redux/ads/ads.thunks";
import { selectAdCreateStatus } from "@/redux/ads/ads.selectors";
import { showSuccess } from "@/components/ui/toast";
import CachedImage from "@/components/ui/CachedImage";

export default function CreatedAdFormScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createStatus = useAppSelector(selectAdCreateStatus);

  const [duration, setDuration] = useState<string>("86400");
  const [link, setLink] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [banner, setBanner] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  const picking = createStatus === "loading";

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // you can toast here
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setBanner({
        uri: asset.uri,
        name: asset.fileName ?? "banner.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const handleSubmit = async () => {
    if (!link) {
      // basic client-side guard
      return;
    }

    try {
      await dispatch(
        createAd({
          duration: duration || 86400,
          link,
          banner: banner || undefined,
        })
      ).unwrap();

      showSuccess("Ad created!");
      router.back();
    } catch (e) {
      // errors already toasted by axios interceptor / thunk reject
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      {/* Top bar */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Created ADs
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[13px] font-satoshiMedium text-neutral-900 mb-2">
          Flyer Banner
        </Text>

        <Pressable
          onPress={handlePickImage}
          disabled={picking}
          className="rounded-3xl border-2 border-dashed border-primary px-4 py-6 items-center mb-5"
        >
          {banner ? (
            <View className="w-full rounded-2xl overflow-hidden mb-3">
              <CachedImage uri={banner.uri} className="w-full h-36" />
            </View>
          ) : (
            <Text className="text-[13px] font-satoshi text-neutral-700 mb-4">
              Tap to pick a banner image
            </Text>
          )}
          <View className="px-6 py-2 rounded-2xl bg-primary">
            <Text className="text-white font-satoshiMedium text-[13px]">
              {banner ? "Change Image" : "Upload Image"}
            </Text>
          </View>
        </Pressable>

        <Label text="Business Name" />
        <Input
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Enter business name"
        />

        <Label text="Ad Link (URL)" />
        <Input
          value={link}
          onChangeText={setLink}
          placeholder="https://placehold.co/600x400"
        />

        <Label text="Caption" />
        <Multiline
          value={caption}
          onChangeText={setCaption}
          placeholder="Craving something delicious?..."
        />

        <View className="flex-row mt-3">
          <View className="flex-1 mr-2">
            <Label text="Start Date" />
            <Input
              value={startDate}
              onChangeText={setStartDate}
              placeholder="DD/MM/YYYY"
            />
          </View>
          <View className="flex-1 ml-2">
            <Label text="End Date" />
            <Input
              value={endDate}
              onChangeText={setEndDate}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </View>

        <Label text="Duration (seconds)" />
        <Input
          value={duration}
          onChangeText={setDuration}
          placeholder="86400"
          keyboardType="numeric"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={picking}
          className="mt-8 bg-primary rounded-2xl py-4 items-center flex-row justify-center"
        >
          {picking && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-white font-satoshiMedium text-[15px]">
            {picking ? "Uploading..." : "Upload"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text className="text-[13px] font-satoshiMedium text-neutral-900 mt-3 mb-1">
      {text}
    </Text>
  );
}

type InputProps = {
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
};

function Input({ value, onChangeText, placeholder, keyboardType }: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      className="bg-[#F3F4F6] rounded-2xl px-3 py-3 font-satoshi text-[13px]"
      placeholderTextColor="#9CA3AF"
    />
  );
}

type MultilineProps = {
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder: string;
};

function Multiline({ value, onChangeText, placeholder }: MultilineProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholder={placeholder}
      className="bg-[#F3F4F6] rounded-2xl px-3 py-3 font-satoshi text-[13px]"
      placeholderTextColor="#9CA3AF"
    />
  );
}
