import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserById } from "@/redux/users/users.thunks";
import { makeSelectUserById, makeSelectByIdStatus } from "@/redux/users/users.selectors";
import CachedImageView from "@/components/ui/CachedImage";
import { formatNGN } from "@/utils/money";

type Tab = "profile" | "menu";

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>("profile");

  const vendor = useAppSelector(makeSelectUserById(id!));
  const status = useAppSelector(makeSelectByIdStatus(id!));

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  if (status === "loading" && !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator color="#ffa800" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <Text className="font-satoshiBold text-black">Vendor not found</Text>
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
            Vendor Details
          </Text>
        </View>
      </View>

      {/* tabs */}
      <View className="px-5 mb-3">
        <View className="flex-row bg-white rounded-full p-1">
          {(["profile", "menu"] as Tab[]).map((key) => {
            const active = key === tab;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={`flex-1 px-3 py-1.5 rounded-full items-center ${
                  active ? "bg-primary" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-satoshiMedium ${
                    active ? "text-white" : "text-neutral-700"
                  }`}
                >
                  {key === "profile" ? "Profile" : "Menu"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === "profile" ? <ProfileTab vendor={vendor} /> : <MenuTab vendor={vendor} />}
    </SafeAreaView>
  );
}

function ProfileTab({ vendor }: { vendor: any }) {
  const kitchen = vendor.kitchen;
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <View className="bg-white rounded-3xl px-4 py-4 mb-4 border border-neutral-100">
        <View className="rounded-2xl overflow-hidden bg-gray-200 h-32 mb-4">
          <CachedImageView
            uri={kitchen?.cover_image?.url || vendor.profile_picture?.url}
            className="w-full h-full"
          />
        </View>
        <Info label="Business Name" value={kitchen?.name || `${vendor.first_name} ${vendor.last_name}`} />
        <Info label="Phone Number" value={kitchen?.phone_number || vendor.phone_number} />
        <Info label="Address" value={kitchen?.address || "No address provided"} />
        <Info label="Date of SignUp" value={new Date(vendor.created_at).toLocaleDateString()} />
        <Info label="Account Role" value={vendor.role || "VENDOR"} />
        <View className="flex-row mt-3">
          <View className="flex-1 mr-2">
            <Info label="Open Time" value={kitchen?.opening_time || "N/A"} />
          </View>
          <View className="flex-1 ml-2">
            <Info label="Closing Time" value={kitchen?.closing_time || "N/A"} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function MenuTab({ vendor }: { vendor: any }) {
  const kitchen = vendor.kitchen;
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <View className="bg-white rounded-3xl px-4 py-4 mb-4 flex-row items-center justify-between border border-neutral-100">
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Opens
          </Text>
          <Text className="text-[12px] font-satoshiBold text-neutral-900">
            {kitchen?.opening_time || "N/A"}
          </Text>
        </View>
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Prep Time
          </Text>
          <Text className="text-[12px] font-satoshiBold text-neutral-900">
            {kitchen?.preparation_time || "N/A"}
          </Text>
        </View>
        <View>
          <Text className="text-[11px] text-neutral-500 font-satoshi">
            Rating
          </Text>
          <Text className="text-[12px] font-satoshiBold text-neutral-900">
            {kitchen?.rating || "0.0"}
          </Text>
        </View>
        <View className="items-end">
          <Pressable className="px-3 py-1 rounded-full bg-amber-500">
            <Text className="text-[11px] text-white font-satoshiBold">
              Suspend
            </Text>
          </Pressable>
        </View>
      </View>

      <Text className="text-[12px] text-neutral-500 font-satoshi mb-4 px-1">
        Currently shows general kitchen profile. Item-level integration would require fetching specific kitchen items.
      </Text>
    </ScrollView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] text-neutral-500 font-satoshi">{label}</Text>
      <View className="mt-1 bg-[#F3F4F6] rounded-2xl px-3 py-2">
        <Text className="text-[12px] text-neutral-900 font-satoshi">
          {value}
        </Text>
      </View>
    </View>
  );
}
