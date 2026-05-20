import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { showError, showSuccess } from "@/components/ui/toast";
import {
  acceptDeliveryOffer,
  counterDeliveryOffer,
  createDeliveryOffer,
  fetchDeliveries,
  fetchDeliveryOffers,
  fetchRiderProfile,
  rejectDeliveryOffer,
  riderAcceptCounterOffer,
  updateDeliveryStatus,
  updateRiderStatus,
} from "@/redux/logistics/logistics.thunks";
import {
  selectDeliveries,
  selectLogisticsMutationStatus,
  selectLogisticsStatus,
  selectOffersForOrder,
  selectRiderProfile,
} from "@/redux/logistics/logistics.selectors";
import type { Delivery, DeliveryOffer, DeliveryStatus } from "@/redux/logistics/logistics.types";
import { selectUnreadNotificationsCount } from "@/redux/notifications/notifications.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectWalletBalanceNumber, selectWalletProfileStatus } from "@/redux/wallet/wallet.selectors";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";

const ACTIVE_STATUSES: DeliveryStatus[] = ["ASSIGNED", "AWAITING_PICKUP", "PICKED_UP", "IN_TRANSIT"];
const getOrderId = (delivery: Delivery) => delivery.order_id || String(delivery.order?.id ?? "");

const getPickup = (delivery: Delivery) =>
  String(
    delivery.pickup_address ??
      delivery.order?.kitchen?.address ??
      delivery.order?.kitchen?.location ??
      "Pickup pending"
  );

const getDropoff = (delivery: Delivery) =>
  String(
    delivery.dropoff_address ??
      delivery.delivery_address ??
      delivery.order?.delivery_address ??
      "Dropoff pending"
  );

const getDeliveryFee = (delivery: Delivery, offer?: DeliveryOffer) =>
  offer?.amount ?? delivery.delivery_fee ?? delivery.earning?.amount ?? 0;

function DeliveryCard({
  delivery,
  offer,
  isDark,
  isBusy,
  customOffer,
  setCustomOffer,
  onSendOffer,
  onCounterOffer,
  onOfferAction,
  onStatus,
}: {
  delivery: Delivery;
  offer?: DeliveryOffer;
  isDark: boolean;
  isBusy: boolean;
  customOffer: string;
  setCustomOffer: (value: string) => void;
  onSendOffer: () => void;
  onCounterOffer: () => void;
  onOfferAction: (action: "accept" | "rider-accept" | "reject") => void;
  onStatus: (status: DeliveryStatus) => void;
}) {
  const canProgress = ACTIVE_STATUSES.includes(delivery.delivery_status);
  const nextStatus: DeliveryStatus | null =
    delivery.delivery_status === "ASSIGNED"
      ? "AWAITING_PICKUP"
      : delivery.delivery_status === "AWAITING_PICKUP"
        ? "PICKED_UP"
        : delivery.delivery_status === "PICKED_UP"
          ? "IN_TRANSIT"
          : delivery.delivery_status === "IN_TRANSIT"
            ? "DELIVERED"
            : null;
  const amount = getDeliveryFee(delivery, offer);

  return (
    <View
      className={`rounded-3xl px-4 py-4 mb-3 border ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className={`text-[13px] font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
          Delivery #{delivery.id.slice(0, 8)}
        </Text>
        <Text className="text-[10px] font-satoshiBold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
          {delivery.delivery_status}
        </Text>
      </View>

      <Text className={`mt-2 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
        Pickup: {getPickup(delivery)}
      </Text>
      <Text className={`mt-1 text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
        Dropoff: {getDropoff(delivery)}
      </Text>
      <Text className={`mt-2 text-[13px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
        {Number(amount) ? formatNGN(amount) : "Fee pending"}
      </Text>

      {offer ? (
        <View className={`mt-3 rounded-2xl p-3 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Your offer
            </Text>
            <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {formatNGN(offer.amount)}
            </Text>
          </View>
          <Text className="text-primary font-satoshiBold mt-1">{offer.status}</Text>
        </View>
      ) : null}

      <View
        className={`mt-3 flex-row items-center rounded-2xl px-3 py-2 border ${
          isDark ? "bg-neutral-950 border-neutral-800" : "bg-primary-50 border-neutral-200"
        }`}
      >
        <Text className={`${isDark ? "text-neutral-300" : "text-neutral-700"} mr-2`}>₦</Text>
        <TextInput
          value={customOffer}
          onChangeText={(text) => setCustomOffer(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder={offer ? "Counter amount" : "Offer amount"}
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 text-[14px] ${isDark ? "text-white" : "text-neutral-900"}`}
        />
      </View>

      <View className="flex-row mt-3">
        <Pressable
          onPress={offer ? onCounterOffer : onSendOffer}
          disabled={isBusy}
          className={`flex-1 rounded-2xl py-3 items-center mr-2 ${isBusy ? "bg-primary/60" : "bg-primary"}`}
        >
          {isBusy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-satoshiBold">{offer ? "Counter" : "Send Offer"}</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => onOfferAction("reject")}
          disabled={!offer || isBusy}
          className={`flex-1 rounded-2xl py-3 items-center ${
            isDark ? "bg-neutral-800" : "bg-neutral-100"
          }`}
          style={{ opacity: !offer || isBusy ? 0.6 : 1 }}
        >
          <Text className={`${isDark ? "text-neutral-200" : "text-neutral-700"} font-satoshiMedium`}>
            Reject Offer
          </Text>
        </Pressable>
      </View>

      {offer && offer.status !== "ACCEPTED" && offer.status !== "REJECTED" ? (
        <View className="flex-row mt-3">
          <Pressable
            onPress={() => onOfferAction("rider-accept")}
            disabled={isBusy}
            className="flex-1 rounded-2xl py-3 items-center bg-primary mr-2"
          >
            <Text className="text-white font-satoshiBold">Accept Counter</Text>
          </Pressable>
          <Pressable
            onPress={() => onOfferAction("accept")}
            disabled={isBusy}
            className={`flex-1 rounded-2xl py-3 items-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
          >
            <Text className={`${isDark ? "text-neutral-200" : "text-neutral-700"} font-satoshiMedium`}>
              Accept Offer
            </Text>
          </Pressable>
        </View>
      ) : null}

      {canProgress && nextStatus ? (
        <Pressable
          onPress={() => onStatus(nextStatus)}
          disabled={isBusy}
          className="mt-3 rounded-2xl py-3 items-center bg-primary"
        >
          <Text className="text-white font-satoshiBold">
            {nextStatus === "AWAITING_PICKUP"
              ? "Head to Pickup"
              : nextStatus === "PICKED_UP"
                ? "Mark Picked Up"
                : nextStatus === "IN_TRANSIT"
                  ? "Start Delivery"
                  : "Mark Delivered"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function RiderHomeScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const dispatch = useAppDispatch();
  const riderProfile = useAppSelector(selectRiderProfile);
  const deliveries = useAppSelector(selectDeliveries);
  const logisticsStatus = useAppSelector(selectLogisticsStatus);
  const mutationStatus = useAppSelector(selectLogisticsMutationStatus);
  const unreadNotifications = useAppSelector(selectUnreadNotificationsCount);
  const walletBalance = useAppSelector(selectWalletBalanceNumber);
  const walletStatus = useAppSelector(selectWalletProfileStatus);
  const [online, setOnline] = useState(false);
  const [customOffer, setCustomOffer] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const orderIds = useMemo(
    () => Array.from(new Set(deliveries.map(getOrderId).filter(Boolean))),
    [deliveries]
  );

  const offersByOrder = useAppSelector((state) => {
    const mapped: Record<string, DeliveryOffer[]> = {};
    for (const orderId of orderIds) {
      mapped[orderId] = selectOffersForOrder(orderId)(state);
    }
    return mapped;
  });

  useEffect(() => {
    dispatch(fetchRiderProfile());
    dispatch(fetchDeliveries({ page: 1, per_page: 50 }));
    if (walletStatus === "idle") dispatch(fetchWalletProfile({ as_rider: true }));
  }, [dispatch, walletStatus]);

  useEffect(() => {
    setOnline(Boolean(riderProfile?.is_available));
  }, [riderProfile?.is_available]);

  useEffect(() => {
    orderIds.forEach((orderId) => {
      dispatch(fetchDeliveryOffers(orderId));
    });
  }, [dispatch, orderIds]);

  const reload = async () => {
    try {
      setRefreshing(true);
      const profile = await dispatch(fetchRiderProfile()).unwrap();
      await dispatch(fetchDeliveries({ page: 1, per_page: 50 })).unwrap();
      await dispatch(fetchWalletProfile({ as_rider: true })).unwrap();
      if (profile?.id) {
        await dispatch(fetchDeliveries({ page: 1, per_page: 50, rider_id: profile.id })).unwrap();
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleOnline = async (value: boolean) => {
    setOnline(value);
    if (!riderProfile?.id) {
      showError("Create your rider profile before going online.");
      return;
    }
    try {
      await dispatch(
        updateRiderStatus({
          rider_id: riderProfile.id,
          is_available: value,
          is_blocked: riderProfile.is_blocked,
        })
      ).unwrap();
      showSuccess(value ? "You are online." : "You are offline.");
    } catch (error: any) {
      setOnline(Boolean(riderProfile.is_available));
      showError(error);
    }
  };

  const riderOfferFor = (delivery: Delivery) => {
    const orderId = getOrderId(delivery);
    return (offersByOrder[orderId] ?? [])
      .filter((offer) => !riderProfile?.id || offer.rider_id === riderProfile.id)
      .sort((a, b) => Number(b.updated_at ?? b.created_at) - Number(a.updated_at ?? a.created_at))[0];
  };

  const sendOffer = async (delivery: Delivery) => {
    const orderId = getOrderId(delivery);
    const amount = Number(customOffer[delivery.id]);
    if (!orderId) return showError("This delivery is missing an order reference.");
    if (!amount) return showError("Enter an offer amount.");
    try {
      await dispatch(createDeliveryOffer({ order_id: orderId, amount })).unwrap();
      setCustomOffer((prev) => ({ ...prev, [delivery.id]: "" }));
      await dispatch(fetchDeliveryOffers(orderId)).unwrap();
      showSuccess("Offer sent to customer.");
    } catch (error: any) {
      showError(error);
    }
  };

  const counterOffer = async (delivery: Delivery, offer?: DeliveryOffer) => {
    const amount = Number(customOffer[delivery.id]);
    if (!offer) return showError("No delivery offer found.");
    if (!amount) return showError("Enter a counter amount.");
    try {
      await dispatch(counterDeliveryOffer({ offer_id: offer.id, amount })).unwrap();
      setCustomOffer((prev) => ({ ...prev, [delivery.id]: "" }));
      await dispatch(fetchDeliveryOffers(offer.order_id)).unwrap();
      showSuccess("Counter offer sent.");
    } catch (error: any) {
      showError(error);
    }
  };

  const actOnOffer = async (
    action: "accept" | "rider-accept" | "reject",
    offer?: DeliveryOffer
  ) => {
    if (!offer) return showError("No delivery offer found.");
    try {
      if (action === "accept") await dispatch(acceptDeliveryOffer(offer.id)).unwrap();
      if (action === "rider-accept") await dispatch(riderAcceptCounterOffer(offer.id)).unwrap();
      if (action === "reject") await dispatch(rejectDeliveryOffer(offer.id)).unwrap();
      await dispatch(fetchDeliveryOffers(offer.order_id)).unwrap();
      await dispatch(fetchDeliveries({ page: 1, per_page: 50 })).unwrap();
      showSuccess("Delivery offer updated.");
    } catch (error: any) {
      showError(error);
    }
  };

  const setDelivery = async (deliveryId: string, delivery_status: DeliveryStatus) => {
    try {
      await dispatch(updateDeliveryStatus({ delivery_id: deliveryId, delivery_status })).unwrap();
      showSuccess("Delivery updated.");
    } catch (error: any) {
      showError(error);
    }
  };

  const availableDeliveries = deliveries.filter((delivery) =>
    online &&
    (delivery.delivery_status === "PENDING" ||
      (delivery.delivery_status === "ASSIGNED" && !delivery.rider_id))
  );
  const activeDeliveries = deliveries.filter((delivery) =>
    ACTIVE_STATUSES.includes(delivery.delivery_status) &&
    (!riderProfile?.id || delivery.rider_id === riderProfile.id)
  );
  const todayTrips = deliveries.filter((delivery) => delivery.delivery_status === "DELIVERED").length;
  const isBusy = mutationStatus === "loading";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={reload} tintColor="#F59E0B" />
        }
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className={`text-lg font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Hey Rider
            </Text>
            <Text className={`text-xs font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Stay online to receive delivery offers
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-[12px] font-satoshiMedium ${
                online ? "text-emerald-500" : isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {online ? "Online" : "Offline"}
            </Text>
            <Switch
              value={online}
              onValueChange={toggleOnline}
              thumbColor={online ? "#F59E0B" : "#9CA3AF"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
            <Pressable onPress={() => router.push("/notifications" as any)} className="ml-2">
              <Ionicons name="notifications-outline" size={23} color={isDark ? "#E5E7EB" : "#111827"} />
              {unreadNotifications > 0 ? (
                <View className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 items-center justify-center">
                  <Text className="text-white text-[9px] font-satoshiBold">{unreadNotifications}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          {[
            { label: "Wallet", value: formatNGN(walletBalance) },
            { label: "Trips", value: String(todayTrips) },
          ].map((card) => (
            <View
              key={card.label}
              className={`flex-1 rounded-2xl p-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {card.label}
              </Text>
              <Text className={`mt-1 text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        <Text className={`text-[16px] font-satoshiBold mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Available deliveries
        </Text>

        {logisticsStatus === "loading" && !deliveries.length ? (
          <View className="py-6 items-center">
            <ActivityIndicator color="#F59E0B" />
          </View>
        ) : null}

        {!online ? (
          <View
            className={`rounded-2xl p-4 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              You are offline. Go online to see available deliveries.
            </Text>
          </View>
        ) : availableDeliveries.length ? (
          availableDeliveries.map((delivery) => {
            const offer = riderOfferFor(delivery);
            return (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                offer={offer}
                isDark={isDark}
                isBusy={isBusy}
                customOffer={customOffer[delivery.id] || ""}
                setCustomOffer={(value) => setCustomOffer((prev) => ({ ...prev, [delivery.id]: value }))}
                onSendOffer={() => sendOffer(delivery)}
                onCounterOffer={() => counterOffer(delivery, offer)}
                onOfferAction={(action) => actOnOffer(action, offer)}
                onStatus={(status) => setDelivery(delivery.id, status)}
              />
            );
          })
        ) : (
          <View
            className={`rounded-2xl p-4 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              No available deliveries right now.
            </Text>
          </View>
        )}

        {activeDeliveries.length ? (
          <>
            <Text className={`text-[16px] font-satoshiBold mt-5 mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
              Active deliveries
            </Text>
            {activeDeliveries.map((delivery) => {
              const offer = riderOfferFor(delivery);
              return (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  offer={offer}
                  isDark={isDark}
                  isBusy={isBusy}
                  customOffer={customOffer[delivery.id] || ""}
                  setCustomOffer={(value) => setCustomOffer((prev) => ({ ...prev, [delivery.id]: value }))}
                  onSendOffer={() => sendOffer(delivery)}
                  onCounterOffer={() => counterOffer(delivery, offer)}
                  onOfferAction={(action) => actOnOffer(action, offer)}
                  onStatus={(status) => setDelivery(delivery.id, status)}
                />
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
