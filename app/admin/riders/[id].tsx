import React, { useEffect } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserById } from "@/redux/users/users.thunks";
import { makeSelectUserById, makeSelectByIdStatus } from "@/redux/users/users.selectors";
import CachedImageView from "@/components/ui/CachedImage";

export default function RiderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const rider = useAppSelector(makeSelectUserById(id!));
  const status = useAppSelector(makeSelectByIdStatus(id!));

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  if (status === "loading" && !rider) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator color="#ffa800" />
      </View>
    );
  }

  if (!rider) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <Text className="font-satoshiBold text-black">Rider not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
          <Text className="text-white">Back</Text>
        </Pressable>
      </View>
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
            Riders Details
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <View className="items-center mb-4">
          <View className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100 mb-2 border border-neutral-200">
            <CachedImageView
              uri={rider.profile_picture?.url}
              className="w-full h-full"
            />
          </View>
          <Text className="text-[18px] font-satoshiBold text-neutral-900">
            {rider.first_name} {rider.last_name}
          </Text>
          <Text className="text-[14px] font-satoshi text-neutral-500">
            {rider.email}
          </Text>
        </View>

        <DetailRow label="First Name" value={rider.first_name} />
        <DetailRow label="Last Name" value={rider.last_name} />
        <DetailRow label="Phone Number" value={rider.phone_number} />
        <DetailRow label="Address" value={rider.kitchen?.address || "No address on file"} />
        <DetailRow label="Date of SignUp" value={new Date(rider.created_at).toLocaleDateString()} />
        <DetailRow label="Verified Status" value={rider.is_verified ? "Verified" : "Pending"} />
        <DetailRow label="Role" value={rider.role || "RIDER"} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] text-neutral-500 font-satoshi">{label}</Text>
      <View className="mt-1 bg-white rounded-2xl px-3 py-2">
        <Text className="text-[12px] font-satoshi text-neutral-900">
          {value}
        </Text>
      </View>
    </View>
  );
}
