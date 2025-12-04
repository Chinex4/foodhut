import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAdById,
  makeSelectAdUpdateStatus,
} from "@/redux/ads/ads.selectors";
import { fetchAdById, updateAdById } from "@/redux/ads/ads.thunks";
import { showSuccess } from "@/components/ui/toast";

export default function EditAdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const ad = useAppSelector(selectAdById(id));
  const updateStatus = useAppSelector(makeSelectAdUpdateStatus(id));

  const [duration, setDuration] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [banner, setBanner] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    if (!ad) {
      dispatch(fetchAdById(id));
    } else {
      setDuration(String(ad.duration));
      setLink(ad.link);
      // we only set banner if user picks a new one
    }
  }, [ad, dispatch, id]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

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

  const saving = updateStatus === "loading";

  const handleSave = async () => {
    if (!id) return;
    try {
      await dispatch(
        updateAdById({
          id,
          body: {
            duration: duration || undefined,
            link: link || undefined,
            banner: banner || undefined,
          },
        })
      ).unwrap();

      showSuccess("Ad updated");
      router.back();
    } catch (e) {
      // errors toasted
    }
  };

  if (!ad) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Edit Ad
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
          disabled={saving}
          className="rounded-3xl border-2 border-dashed border-primary px-4 py-6 items-center mb-5"
        >
          <View className="w-full rounded-2xl overflow-hidden mb-3 bg-gray-200 h-36">
            <Image
              source={
                banner?.uri
                  ? { uri: banner.uri }
                  : ad.banner_image?.url
                    ? { uri: ad.banner_image.url }
                    : require("@/assets/images/banner-placeholder.png")
              }
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="px-6 py-2 rounded-2xl bg-primary">
            <Text className="text-white font-satoshiMedium text-[13px]">
              Change Image
            </Text>
          </View>
        </Pressable>

        <Label text="Ad Link (URL)" />
        <Input
          value={link}
          onChangeText={setLink}
          placeholder="https://placehold.co/600x400"
        />

        <Label text="Duration (seconds)" />
        <Input
          value={duration}
          onChangeText={setDuration}
          placeholder="86400"
          keyboardType="numeric"
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-8 bg-primary rounded-2xl py-4 items-center flex-row justify-center"
        >
          {saving && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-white font-satoshiMedium text-[15px]">
            {saving ? "Saving..." : "Save Changes"}
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
