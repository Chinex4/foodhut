import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAdById,
  makeSelectAdByIdStatus,
} from "@/redux/ads/ads.selectors";
import { deleteAdById, fetchAdById } from "@/redux/ads/ads.thunks";

export default function AdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const ad = useAppSelector(selectAdById(id));
  const status = useAppSelector(makeSelectAdByIdStatus(id));

  useEffect(() => {
    if (!id) return;
    if (!ad && status !== "loading") {
      dispatch(fetchAdById(id));
    }
  }, [ad, dispatch, id, status]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await dispatch(deleteAdById(id)).unwrap();
      router.back();
    } catch (e) {
      // error already toasted
    }
  };

  if (!ad || status === "loading") {
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
            Ad Detail
          </Text>
        </View>
        <Pressable onPress={() => router.push(`/admin/ads/${ad.id}/edit`)}>
          <Text className="text-[13px] font-satoshiMedium text-primary">
            Edit
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl overflow-hidden bg-gray-200 mb-4">
          <Image
            source={
              ad.banner_image?.url
                ? { uri: ad.banner_image.url }
                : require("@/assets/images/banner-placeholder.png")
            }
            className="w-full h-40"
            resizeMode="cover"
          />
        </View>

        <Text className="text-[13px] text-neutral-500 font-satoshi mb-1">
          Link
        </Text>
        <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-3">
          {ad.link}
        </Text>

        <Text className="text-[13px] text-neutral-500 font-satoshi mb-1">
          Duration
        </Text>
        <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-3">
          {ad.duration} seconds
        </Text>

        <Text className="text-[13px] text-neutral-500 font-satoshi mb-1">
          Created At
        </Text>
        <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-3">
          {ad.created_at}
        </Text>

        {ad.updated_at && (
          <>
            <Text className="text-[13px] text-neutral-500 font-satoshi mb-1">
              Updated At
            </Text>
            <Text className="text-[14px] font-satoshiMedium text-neutral-900 mb-3">
              {ad.updated_at}
            </Text>
          </>
        )}

        <Pressable
          onPress={handleDelete}
          className="mt-8 bg-red-500 rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-satoshiMedium text-[15px]">
            Delete Ad
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
