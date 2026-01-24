import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import { showSuccess } from "@/components/ui/toast";

type RideOffer = {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  eta: string;
  customerName: string;
  customerPhone: string;
  suggestedFare: string;
  note?: string;
};

type RideStage =
  | "pending"
  | "accepted"
  | "arrived_pickup"
  | "picked_up"
  | "arrived_dropoff"
  | "completed";

const mockOffers: RideOffer[] = [
  {
    id: "FH-237895",
    pickup: "Food Hut - Ikoyi",
    dropoff: "12, Kaduri street, Lagos",
    distance: "4.2 km",
    eta: "18 mins",
    customerName: "Faith A.",
    customerPhone: "+234 809 260 4955",
    suggestedFare: "₦2,500",
    note: "Leave at reception if I’m not home.",
  },
  {
    id: "FH-237896",
    pickup: "Mama’s Kitchen - Lekki",
    dropoff: "1, Umu street, Lagos",
    distance: "6.8 km",
    eta: "25 mins",
    customerName: "Kunle O.",
    customerPhone: "+234 701 222 9931",
    suggestedFare: "₦3,400",
  },
  {
    id: "FH-237897",
    pickup: "Urban Eats - VI",
    dropoff: "45, Herbert Macaulay, Lagos",
    distance: "5.5 km",
    eta: "21 mins",
    customerName: "Maya I.",
    customerPhone: "+234 812 334 1001",
    suggestedFare: "₦2,900",
    note: "Call when you arrive.",
  },
];

export default function RiderHomeScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [online, setOnline] = useState(true);
  const [offers, setOffers] = useState<RideOffer[]>(mockOffers);
  const [activeRide, setActiveRide] = useState<RideOffer | null>(null);
  const [stage, setStage] = useState<RideStage>("pending");
  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [negotiationAmount, setNegotiationAmount] = useState("");
  const [shareLocation, setShareLocation] = useState(true);

  const canProgress = useMemo(() => {
    return activeRide && stage !== "completed";
  }, [activeRide, stage]);

  const acceptOffer = (offer: RideOffer) => {
    setActiveRide(offer);
    setStage("accepted");
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    showSuccess("Ride accepted. Head to pickup.");
  };

  const rejectOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const sendNegotiation = (id: string) => {
    if (!negotiationAmount.trim()) return;
    setNegotiationId(null);
    setNegotiationAmount("");
    showSuccess("Offer sent to customer.");
  };

  const advanceStage = () => {
    const order: RideStage[] = [
      "accepted",
      "arrived_pickup",
      "picked_up",
      "arrived_dropoff",
      "completed",
    ];
    const currentIndex = order.indexOf(stage);
    const nextStage = order[Math.min(currentIndex + 1, order.length - 1)];
    setStage(nextStage);
    if (nextStage === "completed") {
      showSuccess("Ride completed.");
      setActiveRide(null);
      setStage("pending");
    }
  };

  const stageLabel =
    stage === "accepted"
      ? "Accepted"
      : stage === "arrived_pickup"
        ? "Arrived at pickup"
        : stage === "picked_up"
          ? "Picked up order"
          : stage === "arrived_dropoff"
            ? "Arrived at customer"
            : stage === "completed"
              ? "Completed"
              : "Idle";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text
              className={`text-lg font-satoshiBold ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Hey Rider 👋
            </Text>
            <Text
              className={`text-xs font-satoshi ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Stay online to receive ride offers
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
              value={shareLocation}
              onValueChange={setShareLocation}
              thumbColor={shareLocation ? "#F59E0B" : "#9CA3AF"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
          </View>
        </View>

        <View
          className={`rounded-3xl px-4 py-4 mb-5 ${
            isDark ? "bg-neutral-900" : "bg-white"
          } border ${isDark ? "border-neutral-800" : "border-neutral-100"}`}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className={`text-sm font-satoshiMedium ${
                isDark ? "text-neutral-100" : "text-neutral-900"
              }`}
            >
              Live location
            </Text>
            <Pressable
              onPress={() => showSuccess("Live location shared with customer.")}
              className="flex-row items-center"
            >
              <Ionicons name="share-social-outline" size={16} color={isDark ? "#E5E7EB" : "#0F172A"} />
              <Text className={`ml-1 text-[12px] font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                Broadcast
              </Text>
            </Pressable>
          </View>
          <View
            className={`h-36 rounded-2xl items-center justify-center ${
              isDark ? "bg-neutral-800" : "bg-amber-50"
            }`}
          >
            <Ionicons
              name="map-outline"
              size={28}
              color={isDark ? "#9CA3AF" : "#92400e"}
            />
            <Text
              className={`mt-2 text-[12px] font-satoshi ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Google Maps preview (live tracking)
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-3">
            <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Share live updates with customer
            </Text>
            <Switch
              value={online}
              onValueChange={setOnline}
              thumbColor={online ? "#F59E0B" : "#9CA3AF"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-5">
          {[
            { label: "Today", value: "₦24,500" },
            { label: "Week", value: "₦102,300" },
          ].map((stat) => (
            <View
              key={stat.label}
              className={`flex-1 rounded-3xl px-4 py-3 ${
                isDark ? "bg-neutral-900" : "bg-[#FFE7BA]"
              }`}
            >
              <Text className={`text-xs font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-700"} mb-1`}>
                {stat.label} earnings
              </Text>
              <Text className={`text-xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <Text className={`text-base font-satoshiBold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Available Rides
        </Text>
        {offers.map((offer) => (
          <View
            key={offer.id}
            className={`rounded-3xl px-5 py-4 mb-4 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#FFD7A3]"
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`text-sm font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                {offer.id}
              </Text>
              <View className={`px-2 py-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-amber-100"}`}>
                <Text className={`text-[11px] font-satoshiMedium ${isDark ? "text-neutral-200" : "text-amber-700"}`}>
                  {offer.distance} • {offer.eta}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className={`text-sm font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Pickup
              </Text>
              <Text className={`text-sm font-satoshiMedium text-right flex-1 ml-4 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {offer.pickup}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className={`text-sm font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Dropoff
              </Text>
              <Text className={`text-sm font-satoshiMedium text-right flex-1 ml-4 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {offer.dropoff}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className={`text-sm font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Customer
              </Text>
              <Text className={`text-sm font-satoshiMedium text-right ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {offer.customerName}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className={`text-sm font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Contact
              </Text>
              <Text className={`text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {offer.customerPhone}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className={`text-sm font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Offer
              </Text>
              <Text className={`text-sm font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {offer.suggestedFare}
              </Text>
            </View>
            {offer.note ? (
              <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"} mb-3`}>
                Note: {offer.note}
              </Text>
            ) : null}

            {negotiationId === offer.id ? (
              <View className={`rounded-2xl p-3 mb-3 ${isDark ? "bg-neutral-800" : "bg-amber-50"}`}>
                <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-600"} mb-2`}>
                  Send a counter-offer
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    placeholder="Enter amount (e.g ₦3000)"
                    value={negotiationAmount}
                    onChangeText={setNegotiationAmount}
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className={`flex-1 px-3 py-2 rounded-xl border ${
                      isDark ? "text-white border-neutral-700" : "text-neutral-900 border-neutral-200"
                    }`}
                  />
                  <Pressable
                    onPress={() => sendNegotiation(offer.id)}
                    className="ml-2 bg-primary rounded-xl px-3 py-2"
                  >
                    <Text className="text-white font-satoshiMedium">Send</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => rejectOffer(offer.id)}
                className={`flex-1 rounded-2xl py-3 items-center border ${
                  isDark ? "border-neutral-700" : "border-primary"
                }`}
              >
                <Text className={`${isDark ? "text-neutral-200" : "text-primary"} font-satoshiMedium`}>
                  Reject
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setNegotiationId(offer.id)}
                className={`flex-1 rounded-2xl py-3 items-center border ${
                  isDark ? "border-neutral-700" : "border-neutral-200"
                }`}
              >
                <Text className={`font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                  Negotiate
                </Text>
              </Pressable>
              <Pressable
                onPress={() => acceptOffer(offer)}
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
              >
                <Text className="text-white font-satoshiMedium">Accept</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {offers.length === 0 && (
          <View className="items-center py-8">
            <Ionicons name="bicycle-outline" size={36} color={isDark ? "#6B7280" : "#D1D5DB"} />
            <Text className={`mt-3 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              No ride offers right now.
            </Text>
          </View>
        )}

        <Text className={`text-base font-satoshiBold mt-4 mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Active Ride
        </Text>
        <View
          className={`rounded-3xl px-5 py-4 mb-6 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          {activeRide ? (
            <>
              <Text className={`text-sm font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                {activeRide.id} • {stageLabel}
              </Text>
              <Text className={`text-[12px] mt-1 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Pickup: {activeRide.pickup}
              </Text>
              <Text className={`text-[12px] mt-1 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Dropoff: {activeRide.dropoff}
              </Text>

              <View className="flex-row items-center justify-between mt-4">
                <Pressable
                  onPress={() => showSuccess("Customer notified of arrival.")}
                  className={`flex-1 rounded-2xl py-3 items-center border ${
                    isDark ? "border-neutral-700" : "border-neutral-200"
                  }`}
                >
                  <Text className={`font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                    Notify Customer
                  </Text>
                </Pressable>
                <Pressable
                  onPress={advanceStage}
                  disabled={!canProgress}
                  className={`ml-3 flex-1 rounded-2xl py-3 items-center ${
                    canProgress ? "bg-primary" : "bg-neutral-400"
                  }`}
                >
                  <Text className="text-white font-satoshiMedium">
                    {stage === "accepted"
                      ? "Arrived Pickup"
                      : stage === "arrived_pickup"
                        ? "Picked Up"
                        : stage === "picked_up"
                          ? "Arrived Dropoff"
                          : stage === "arrived_dropoff"
                            ? "Complete"
                            : "Start"}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View className="items-center py-6">
              <Ionicons name="time-outline" size={32} color={isDark ? "#6B7280" : "#D1D5DB"} />
              <Text className={`mt-3 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Accept a ride to start delivery.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
