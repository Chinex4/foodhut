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

type Mode = "vendors" | "riders";

const vendorData = new Array(5).fill(null).map((_, i) => ({
  id: `vendor-${i}`,
  name: "MamaPut Kitchen",
  status: i % 2 === 0 ? "Now Open" : "Closed",
}));

const riderData = new Array(5).fill(null).map((_, i) => ({
  id: `rider-${i}`,
  name: "Oga Solo",
  phone: "+234 8094 67223",
  address: "12, Odii Street, Ketu, Lagos",
  approved: i % 2 === 0,
  section: i < 2 ? "Today" : i < 4 ? "Yesterday" : "Dec 19th, 2024",
}));

export function VendorRiderListScreen({
  title,
  initialMode,
}: {
  title: string;
  initialMode: Mode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);

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
          vendorData.map((vendor, idx) => (
            <Pressable
              key={vendor.id}
              onPress={() => router.push(`/admin/vendors/${vendor.id}`)}
              className="bg-white rounded-3xl mb-3 overflow-hidden"
            >
              <View className="m-3 rounded-2xl overflow-hidden bg-gray-200 h-28">
                <Image
                  source={require("@/assets/images/banner-placeholder.png")}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="px-4 pb-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-[14px] font-satoshiMedium text-neutral-900">
                    MamaPut Kitchen
                  </Text>
                  <Text
                    className={`text-[11px] font-satoshi mt-1 ${
                      idx % 2 === 0 ? "text-emerald-600" : "text-neutral-500"
                    }`}
                  >
                    {idx % 2 === 0 ? "Now Open" : "Closed"}
                  </Text>
                </View>
                <Pressable className="px-3 py-1 rounded-full bg-primary">
                  <Text className="text-[11px] text-white font-satoshiMedium">
                    {idx % 2 === 0 ? "Verify Kitchen" : "Unverify Kitchen"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

        {mode === "riders" &&
          ["Today", "Yesterday", "Dec 19th, 2024"].map((section) => (
            <View key={section} className="mb-4">
              <Text className="text-[12px] text-neutral-500 font-satoshi mb-1">
                {section}
              </Text>
              {riderData
                .filter((r) => r.section === section)
                .map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => router.push(`/admin/riders/${r.id}`)}
                    className="bg-white rounded-3xl px-4 py-3 mb-2 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
                      <View>
                        <Text className="text-[13px] font-satoshiMedium text-neutral-900">
                          {r.name}
                        </Text>
                        <Text className="text-[11px] text-emerald-600 font-satoshi">
                          12, Odii Street, Ketu, Lagos
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-[11px] text-neutral-500 font-satoshi mb-1">
                        {r.phone}
                      </Text>
                      <View
                        className={`px-3 py-1 rounded-full border ${
                          r.approved
                            ? "bg-emerald-50 border-emerald-500"
                            : "bg-amber-50 border-amber-700"
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-satoshiMedium ${
                            r.approved ? "text-emerald-700" : "text-amber-800"
                          }`}
                        >
                          {r.approved ? "Approved" : "Unapproved"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
