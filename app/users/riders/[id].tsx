// app/users/riders/[id].tsx
import { emitRiderPicked } from "@/utils/riderBus.native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectLogisticsMutationStatus,
  selectLogisticsRiders,
  selectOffersForOrder,
} from "@/redux/logistics/logistics.selectors";
import {
  acceptDeliveryOffer,
  counterDeliveryOffer,
  createDeliveryOffer,
  fetchDeliveryOffers,
  fetchLogisticsRiders,
  rejectDeliveryOffer,
} from "@/redux/logistics/logistics.thunks";
import { showError, showSuccess } from "@/components/ui/toast";
import { formatNGN } from "@/utils/money";
import type { LogisticsRider } from "@/redux/logistics/logistics.types";

const riderName = (rider?: LogisticsRider) => {
  if (!rider) return "Delivery Rider";
  const fullName = [rider.user?.first_name, rider.user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || rider.user?.email || `Rider #${rider.id.slice(0, 6)}`;
};

export default function RiderDetail() {
  const { id, order_id } = useLocalSearchParams<{ id: string; order_id?: string }>();
  const [offer, setOffer] = useState("");
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const riders = useAppSelector(selectLogisticsRiders);
  const mutationStatus = useAppSelector(selectLogisticsMutationStatus);
  const offersSelector = useMemo(() => selectOffersForOrder(order_id || ""), [order_id]);
  const offers = useAppSelector(offersSelector);
  const rider = riders.find((item) => item.id === id);
  const riderOffers = offers.filter((item) => item.rider_id === id);
  const latestOffer = riderOffers[0];
  const name = riderName(rider);
  const isMutating = mutationStatus === "loading";

  useEffect(() => {
    if (!rider) {
      dispatch(fetchLogisticsRiders({ page: 1, per_page: 50, is_available: true }));
    }
  }, [dispatch, rider]);

  useEffect(() => {
    if (!order_id) return;
    dispatch(fetchDeliveryOffers(order_id));
    const timer = setInterval(() => {
      dispatch(fetchDeliveryOffers(order_id));
    }, 8000);
    return () => clearInterval(timer);
  }, [dispatch, order_id]);

  const request = async () => {
    if (!order_id) {
      return pick();
    }
    const amount = Number(offer.replace(/[^0-9.]/g, ""));
    if (!amount) return showError("Enter an offer amount.");
    try {
      await dispatch(createDeliveryOffer({ order_id, amount })).unwrap();
      setOffer("");
      showSuccess("Offer sent. Waiting for rider response.");
      dispatch(fetchDeliveryOffers(order_id));
    } catch (error: any) {
      showError(error);
    }
  };

  const counter = async () => {
    if (!latestOffer) return;
    const amount = Number(offer.replace(/[^0-9.]/g, ""));
    if (!amount) return showError("Enter a counter amount.");
    try {
      await dispatch(counterDeliveryOffer({ offer_id: latestOffer.id, amount })).unwrap();
      setOffer("");
      showSuccess("Counter offer sent.");
      if (order_id) dispatch(fetchDeliveryOffers(order_id));
    } catch (error: any) {
      showError(error);
    }
  };

  const accept = async () => {
    if (!latestOffer) return pick();
    try {
      await dispatch(acceptDeliveryOffer(latestOffer.id)).unwrap();
      showSuccess("Delivery offer accepted.");
      pick();
    } catch (error: any) {
      showError(error);
    }
  };

  const reject = async () => {
    if (!latestOffer) return router.back();
    try {
      await dispatch(rejectDeliveryOffer(latestOffer.id)).unwrap();
      showSuccess("Delivery offer rejected.");
      if (order_id) dispatch(fetchDeliveryOffers(order_id));
    } catch (error: any) {
      showError(error);
    }
  };

  const pick = () => {
    emitRiderPicked({
      id: id!,
      name,
      city: rider?.is_available ? "Available" : "Unavailable",
      priceLabel: latestOffer ? formatNGN(latestOffer.amount) : "Fee pending",
      rating: rider?.kyc?.verification_status === "VERIFIED" ? 5 : 0,
    });
    router.back();
  };

  return (
    <View className={`flex-1 px-5 pt-12 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <View className="pt-20">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
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
        <View
          className={`rounded-2xl border p-4 ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <View className="items-center">
            <Image
              source={require("@/assets/images/logo-transparent.png")}
              className={`w-20 h-20 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
            />
            <Text className={`mt-2 font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {name}
            </Text>
          </View>

          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-400"}>Name :</Text>
              <Text className={isDark ? "text-neutral-100" : "text-neutral-900"}>{name}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-400"}>City :</Text>
              <Text className={isDark ? "text-neutral-100" : "text-neutral-900"}>
                {rider?.is_available ? "Available" : "Unavailable"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-400"}>Number of Deliveries</Text>
              <Text className={isDark ? "text-neutral-100" : "text-neutral-900"}>-</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-400"}>Amount :</Text>
              <Text className="text-primary font-satoshiBold">
                {latestOffer ? formatNGN(latestOffer.amount) : "Make offer"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className={isDark ? "text-neutral-400" : "text-neutral-400"}>Ratings :</Text>
              <View className="flex-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* actions */}
        {latestOffer ? (
          <View className={`mt-6 rounded-2xl border p-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
            <View className="flex-row items-center justify-between">
              <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>Latest offer</Text>
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(latestOffer.amount)}
              </Text>
            </View>
            <Text className="text-primary font-satoshiBold mt-1">{latestOffer.status}</Text>
          </View>
        ) : null}

        {!latestOffer && (
          <Pressable
            onPress={request}
            disabled={isMutating}
            className={`mt-6 rounded-2xl py-4 items-center justify-center ${isMutating ? "bg-neutral-500" : "bg-primary"}`}
          >
            {isMutating ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-satoshiBold">Send A Request</Text>}
          </Pressable>
        )}
        {latestOffer && latestOffer.status !== "ACCEPTED" && latestOffer.status !== "REJECTED" && (
          <View className="mt-6 flex-row">
            <Pressable
              onPress={reject}
              className={`flex-1 mr-3 rounded-2xl py-4 items-center justify-center border ${
                isDark ? "border-neutral-700" : "border-neutral-400"
              }`}
            >
              <Text className={`font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                Reject
              </Text>
            </Pressable>
            <Pressable
              onPress={accept}
              disabled={isMutating}
              className="flex-1 rounded-2xl py-4 items-center justify-center bg-primary"
            >
              {isMutating ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-satoshiBold">Accept</Text>}
            </Pressable>
          </View>
        )}
        {latestOffer?.status === "ACCEPTED" && (
          <Pressable
            onPress={pick}
            className="mt-6 bg-primary rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white font-satoshiBold">Choose Rider</Text>
          </Pressable>
        )}

        {/* Offer price input */}
        <Text className={`mt-6 mb-2 font-satoshi ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
          {latestOffer ? "Counter Offer Price" : "Riders Offer Price"}
        </Text>
        <View className="flex-row items-center">
          <TextInput
            placeholder="Enter Amount"
            value={offer}
            onChangeText={setOffer}
            keyboardType="numeric"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            className={`flex-1 rounded-2xl px-3 py-3 border ${
              isDark
                ? "bg-neutral-900 border-neutral-800 text-white"
                : "bg-neutral-100 border-transparent text-neutral-900"
            }`}
          />
          <View className="w-3" />
          <Pressable
            disabled={isMutating}
            onPress={latestOffer ? counter : request}
            className="w-12 h-12 rounded-2xl bg-primary items-center justify-center"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
