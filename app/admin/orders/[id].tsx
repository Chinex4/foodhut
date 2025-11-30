import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

type SectionKey = "customer" | "items" | "restaurant" | "delivery";

export default function AdminOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    customer: true,
    items: true,
    restaurant: false,
    delivery: false,
  });

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
            Order #{id}
          </Text>
        </View>

        <Pressable className="px-3 py-1 rounded-full bg-primary">
          <Text className="text-[12px] text-white font-satoshiMedium">
            Cancel Order
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Total amount */}
        <View className="items-center mb-4">
          <View className="px-5 py-3 rounded-2xl bg-secondary">
            <Text className="text-[12px] text-neutral-700 font-satoshi text-center">
              Total Amount
            </Text>
            <Text className="text-[20px] font-satoshiBold text-neutral-900 text-center">
              ₦12,500
            </Text>
          </View>
        </View>

        {/* Order info */}
        <View className="bg-white rounded-3xl px-4 py-4 mb-4">
          <Text className="text-[13px] font-satoshiMedium text-neutral-900 mb-2">
            Order Information
          </Text>
          <InfoRow label="Order ID" value={`#${id}`} />
          <InfoRow label="Order Date & Time" value="Feb 25, 2025 01:30PM" />
          <InfoRow label="Order Status" value="Completed" />
        </View>

        {/* Sections */}
        <CollapseCard
          title="Customer Details"
          open={open.customer}
          toggle={() => setOpen((s) => ({ ...s, customer: !s.customer }))}
        >
          <InfoRow label="Customer Name" value="John Lee" />
          <InfoRow
            label="Delivery Address"
            value="12, Odii Street, Ketu, Lagos"
          />
          <InfoRow label="Contact Number" value="+234 8094 67223" />
          <Text className="text-[12px] font-satoshiMedium text-neutral-700 mt-3 mb-1">
            Message For Restaurant
          </Text>
          <View className="bg-[#F3F4F6] rounded-2xl px-3 py-3">
            <Text className="text-[12px] font-satoshi text-neutral-700">
              Craving something delicious? 🍽️ Join us for a delightful dining
              experience where every bite is crafted with passion...
            </Text>
          </View>
        </CollapseCard>

        <CollapseCard
          title="Order Items"
          open={open.items}
          toggle={() => setOpen((s) => ({ ...s, items: !s.items }))}
        >
          {[1, 2].map((i) => (
            <View
              key={i}
              className="flex-row items-center bg-white rounded-2xl px-3 py-3 mb-2"
            >
              <View className="w-12 h-12 rounded-xl bg-gray-300 mr-3" />
              <View className="flex-1">
                <Text className="text-[13px] font-satoshiMedium text-neutral-900">
                  {i === 1 ? "Fried Rice" : "Chicken Box"}
                </Text>
                <Text className="text-[11px] text-neutral-500 font-satoshi">
                  Item {i} · NGN 5,500
                </Text>
              </View>
            </View>
          ))}
        </CollapseCard>

        <CollapseCard
          title="Restaurant / Vendor Details"
          open={open.restaurant}
          toggle={() => setOpen((s) => ({ ...s, restaurant: !s.restaurant }))}
        >
          <InfoRow label="Restaurant Name" value="The Tasty Hub" />
          <InfoRow
            label="Restaurant Address"
            value="20, Adeola Street, Mile 12, Lagos"
          />
          <InfoRow label="Restaurant Contact" value="+234 8094 67223" />
        </CollapseCard>

        <CollapseCard
          title="Delivery Info"
          open={open.delivery}
          toggle={() => setOpen((s) => ({ ...s, delivery: !s.delivery }))}
        >
          <InfoRow label="Assigned Driver/Rider Name" value="Babatunde" />
          <InfoRow label="Estimated Delivery Time" value="30 mins" />
          <InfoRow label="Rider Contact" value="+234 8094 67223" />
        </CollapseCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-[12px] text-neutral-500 font-satoshi">{label}</Text>
      <Text className="text-[12px] text-neutral-900 font-satoshiMedium">
        {value}
      </Text>
    </View>
  );
}

function CollapseCard({
  title,
  open,
  toggle,
  children,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-3xl px-4 py-4 mb-4">
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between mb-2"
      >
        <Text className="text-[13px] font-satoshiMedium text-neutral-900">
          {title}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </Pressable>
      {open && <View className="mt-1">{children}</View>}
    </View>
  );
}
