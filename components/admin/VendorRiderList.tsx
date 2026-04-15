import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { fetchUsers } from "@/redux/users/users.thunks";
import { selectRiders, selectVendors } from "@/redux/users/users.selectors";
import CachedImageView from "@/components/ui/CachedImage";

type Mode = "vendors" | "riders";

// Removed hardcoded data

export function VendorRiderListScreen({
  title,
  initialMode,
}: {
  title: string;
  initialMode: Mode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<Mode>(initialMode);

  const vendors = useAppSelector(selectVendors);
  const riders = useAppSelector(selectRiders);

  useEffect(() => {
    dispatch(fetchUsers({ per_page: 500 }));
  }, [dispatch]);

  return (
    <View className="flex-1 bg-primary-50">
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            {title}
          </Text>
        </View>

        <Pressable className="w-9 h-9 bg-white rounded-2xl items-center justify-center">
          <Ionicons name="calendar-outline" size={18} color="#111827" />
        </Pressable>
      </View>

      {/* segmented */}
      <View className="px-5 mb-3">
        <View className="flex-row bg-white rounded-full p-1">
          {(["vendors", "riders"] as Mode[]).map((m) => {
            const active = m === mode;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                className={`flex-1 px-3 py-1.5 rounded-full items-center ${
                  active ? "bg-primary" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-satoshiMedium ${
                    active ? "text-white" : "text-neutral-700"
                  }`}
                >
                  {m === "vendors" ? "Vendors" : "Riders"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* search */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={
              mode === "vendors" ? "Search for Vendors" : "Search for Riders"
            }
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 font-satoshi text-[13px]"
          />
          <Pressable className="w-8 h-8 rounded-full bg-[#F3F4F6] items-center justify-center">
            <Ionicons name="options-outline" size={16} color="#4B5563" />
          </Pressable>
        </View>
      </View>

      {/* list */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {mode === "vendors" &&
          vendors.map((vendor) => (
            <Pressable
              key={vendor.id}
              onPress={() => router.push(`/admin/vendors/${vendor.id}`)}
              className="bg-white rounded-3xl mb-3 overflow-hidden border border-neutral-100"
            >
              <View className="m-3 rounded-2xl overflow-hidden bg-gray-200 h-28">
                <CachedImageView
                  uri={vendor.profile_picture?.url}
                  className="w-full h-full"
                />
              </View>
              <View className="px-4 pb-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-[14px] font-satoshiBold text-neutral-900">
                    {vendor.first_name} {vendor.last_name}
                  </Text>
                  <Text
                    className={`text-[11px] font-satoshi mt-1 ${
                      vendor.is_verified ? "text-emerald-600" : "text-neutral-500"
                    }`}
                  >
                    {vendor.is_verified ? "Verified" : "Pending Verification"}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${vendor.is_verified ? "bg-emerald-100" : "bg-neutral-100"}`}>
                  <Text className={`text-[11px] font-satoshiMedium ${vendor.is_verified ? "text-emerald-700" : "text-neutral-600"}`}>
                    {vendor.role}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}

        {mode === "riders" && (
          <View>
            {riders.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push(`/admin/riders/${r.id}`)}
                className="bg-white rounded-3xl px-4 py-3 mb-2 flex-row items-center justify-between border border-neutral-100"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden items-center justify-center mr-3">
                    {r.profile_picture ? (
                      <CachedImageView uri={r.profile_picture.url} className="w-full h-full" />
                    ) : (
                      <Ionicons name="person" size={20} color="#CBD5E1" />
                    )}
                  </View>
                  <View>
                    <Text className="text-[14px] font-satoshiBold text-neutral-900">
                      {r.first_name} {r.last_name}
                    </Text>
                    <Text className="text-[11px] text-neutral-500 font-satoshi">
                      {r.email}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] text-neutral-500 font-satoshi mb-1">
                    {r.phone_number}
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full border ${
                      r.is_verified
                        ? "bg-emerald-50 border-emerald-500"
                        : "bg-amber-50 border-amber-700"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-satoshiBold ${
                        r.is_verified ? "text-emerald-700" : "text-amber-800"
                      }`}
                    >
                      {r.is_verified ? "Verified" : "Pending"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
