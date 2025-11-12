// app/users/riders/[id].tsx
import { emitRiderPicked } from "@/utils/riderBus.native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function RiderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState("");
  const [state, setState] = useState<"idle" | "accepted" | "denied">("idle");

  const rider = {
    id,
    name: "Prosper Chichi",
    city: "Aba, Lagos",
    deliveries: 10,
    priceLabel: "₦ 1,500–₦ 2,000",
    rating: 5,
  };

  const request = () => setState("accepted"); // mock
  const cancel = () => router.back();
  const pick = () => {
    emitRiderPicked({
      id: rider.id!,
      name: rider.name,
      city: rider.city,
      priceLabel: rider.priceLabel,
      rating: rider.rating,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-primary-50 px-5 pt-12">
      <View className="pt-20">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Pressable onPress={() => router.push(`/users/riders/${id}/ratings`)}>
            <View className="bg-primary rounded-xl px-3 py-2">
              <Text className="text-white font-satoshiMedium">
                Rides Rating
              </Text>
            </View>
          </Pressable>
        </View>

        {/* profile card */}
        <View className="bg-white rounded-2xl border border-neutral-100 p-4">
          <View className="items-center">
            <Image
              source={require("@/assets/images/logo-transparent.png")}
              className="w-20 h-20 rounded-full bg-neutral-100"
            />
            <Text className="mt-2 font-satoshiBold text-neutral-900">
              {rider.name}
            </Text>
          </View>

          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-neutral-400">Name :</Text>
              <Text className="text-neutral-900">{rider.name}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-neutral-400">City :</Text>
              <Text className="text-neutral-900">{rider.city}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-neutral-400">Number of Deliveries</Text>
              <Text className="text-neutral-900">{rider.deliveries}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-neutral-400">Amount :</Text>
              <Text className="text-primary font-satoshiBold">
                {rider.priceLabel}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-400">Ratings :</Text>
              <View className="flex-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#f59e0b" />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* actions */}
        {state === "idle" && (
          <Pressable
            onPress={request}
            className="mt-6 bg-primary rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white font-satoshiBold">Send A Request</Text>
          </Pressable>
        )}
        {state === "accepted" && (
          <Pressable
            onPress={pick}
            className="mt-6 bg-primary rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white font-satoshiBold">
              Request Accepted
            </Text>
          </Pressable>
        )}
        {state === "denied" && (
          <View className="mt-6 flex-row">
            <Pressable
              onPress={cancel}
              className="flex-1 mr-3 rounded-2xl py-4 items-center justify-center border border-neutral-400"
            >
              <Text className="font-satoshiMedium text-neutral-900">
                Cancel Request
              </Text>
            </Pressable>
            <Pressable
              disabled
              className="flex-1 rounded-2xl py-4 items-center justify-center bg-neutral-300"
            >
              <Text className="text-white font-satoshiBold">
                Request Denied
              </Text>
            </Pressable>
          </View>
        )}

        {/* Offer price input */}
        <Text className="mt-6 mb-2 text-neutral-900 font-satoshi">
          Riders Offer Price
        </Text>
        <View className="flex-row items-center">
          <TextInput
            placeholder="Enter Amount"
            value={offer}
            onChangeText={setOffer}
            keyboardType="numeric"
            className="flex-1 bg-neutral-100 rounded-2xl px-3 py-3"
          />
          <View className="w-3" />
          <Pressable className="w-12 h-12 rounded-2xl bg-primary items-center justify-center">
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
