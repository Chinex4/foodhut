import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import { showSuccess } from "@/components/ui/toast";
import {
  mockRiderJobs,
  mockRiderWallet,
  type RiderJob,
  type RiderJobStatus,
} from "@/utils/mock/mockRider";

export default function RiderHomeScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [online, setOnline] = useState(true);
  const [jobs, setJobs] = useState<RiderJob[]>(mockRiderJobs);
  const [negotiatingJobId, setNegotiatingJobId] = useState<string | null>(null);
  const [customOffer, setCustomOffer] = useState<Record<string, string>>({});
  const [pendingOffers, setPendingOffers] = useState<
    Record<string, { price: number; secondsLeft: number }>
  >({});

  const canProgress = useMemo(() => {
    return jobs.some((j) => j.status === "ACTIVE" || j.status === "IN_PROGRESS");
  }, [jobs]);

  const setJobStatus = (id: string, status: RiderJobStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const acceptJob = (id: string) => {
    setJobStatus(id, "ACTIVE");
    showSuccess("Job accepted. Head to pickup.");
  };

  const startRide = (id: string) => {
    setJobStatus(id, "IN_PROGRESS");
    showSuccess("Ride started.");
  };

  const endRide = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    showSuccess("Ride completed.");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPendingOffers((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.entries(prev).forEach(([jobId, offer]) => {
          if (offer.secondsLeft <= 0) return;
          next[jobId] = { ...offer, secondsLeft: offer.secondsLeft - 1 };
          changed = true;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parseFare = (fare: string) => {
    const numeric = Number(fare.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatFare = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG")}`;
  };

  const getSuggestedOffers = (fare: string) => {
    const base = parseFare(fare);
    if (!base) return [];
    const a = Math.round((base + 300) / 100) * 100;
    const b = Math.round((base + 500) / 100) * 100;
    const c = Math.round(base * 1.2 / 100) * 100;
    return Array.from(new Set([a, b, c])).filter((v) => v > base).slice(0, 3);
  };

  const sendOffer = (jobId: string, price: number) => {
    if (!price) return;
    setPendingOffers((prev) => ({
      ...prev,
      [jobId]: { price, secondsLeft: 30 },
    }));
    setNegotiatingJobId(null);
    setCustomOffer((prev) => ({ ...prev, [jobId]: "" }));
    showSuccess("Offer sent. Waiting for customer response.");
  };

  const canAcceptJob = (jobId: string) => {
    const offer = pendingOffers[jobId];
    return !offer || offer.secondsLeft <= 0;
  };

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
                online
                  ? "text-emerald-500"
                  : isDark
                    ? "text-neutral-400"
                    : "text-neutral-500"
              }`}
            >
              {online ? "Online" : "Offline"}
            </Text>
            <Switch
              value={online}
              onValueChange={setOnline}
              thumbColor={online ? "#F59E0B" : "#9CA3AF"}
              trackColor={{ false: "#d1d5db", true: "#92400e" }}
            />
          </View>
        </View>

        {/* <View
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
              Live map
            </Text>
          </View>
          <View
            className={`h-44 rounded-2xl items-center justify-center ${
              isDark ? "bg-neutral-800" : "bg-amber-50"
            }`}
          >
            <Ionicons
              name="map-outline"
              size={28}
              color={isDark ? "#9CA3AF" : "#f59e0b"}
            />
            <Text
              className={`text-[12px] mt-2 ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Map preview placeholder
            </Text>
          </View>
        </View> */}

        <View className="flex-row gap-3 mb-4">
          {[
            { label: "Wallet", value: mockRiderWallet.balance },
            { label: "Daily Cash", value: mockRiderWallet.dailyCash },
          ].map((card) => (
            <View
              key={card.label}
              className={`flex-1 rounded-2xl p-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <Text
                className={`text-[12px] ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {card.label}
              </Text>
              <Text
                className={`mt-1 text-[16px] font-satoshiBold ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mb-6">
          {[
            { label: "Trips Today", value: String(mockRiderWallet.todayTrips) },
            { label: "Hours", value: mockRiderWallet.todayHours },
          ].map((card) => (
            <View
              key={card.label}
              className={`flex-1 rounded-2xl p-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <Text
                className={`text-[12px] ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {card.label}
              </Text>
              <Text
                className={`mt-1 text-[16px] font-satoshiBold ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        <Text
          className={`text-[16px] font-satoshiBold mb-3 ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          Available jobs
        </Text>

        {!online ? (
          <View
            className={`rounded-2xl p-4 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
            }`}
          >
            <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              You are offline. Go online to see available jobs.
            </Text>
          </View>
        ) : (
          jobs
            .filter((j) => j.status === "AVAILABLE")
            .map((job) => (
              <View
                key={job.id}
                className={`rounded-3xl px-4 py-4 mb-3 border ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-[13px] font-satoshiMedium ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {job.id}
                  </Text>
                  <View className="px-2 py-1 rounded-full bg-amber-100">
                    <Text className="text-[10px] font-satoshiBold text-amber-700">
                      {job.fare}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`mt-2 text-[12px] ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Pickup: {job.pickup}
                </Text>
                <Text
                  className={`mt-1 text-[12px] ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Dropoff: {job.dropoff}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text
                    className={`text-[11px] ${
                      isDark ? "text-neutral-500" : "text-neutral-500"
                    }`}
                  >
                    {job.distance} • {job.eta}
                  </Text>
                </View>
                <View className="flex-row mt-3">
                  <Pressable
                    onPress={() => acceptJob(job.id)}
                    disabled={!canAcceptJob(job.id)}
                    className={`flex-1 rounded-2xl py-3 items-center mr-2 ${
                      canAcceptJob(job.id) ? "bg-primary" : "bg-primary/60"
                    }`}
                  >
                    <Text className="text-white font-satoshiBold">
                      {canAcceptJob(job.id) ? "Accept" : "Waiting..."}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setJobs((prev) => prev.filter((j) => j.id !== job.id))
                    }
                    className={`flex-1 rounded-2xl py-3 items-center ${
                      isDark ? "bg-neutral-800" : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={`${
                        isDark ? "text-neutral-200" : "text-neutral-700"
                      } font-satoshiMedium`}
                    >
                      Decline
                    </Text>
                  </Pressable>
                </View>

                <View className="mt-3">
                  <Pressable
                    onPress={() =>
                      setNegotiatingJobId((prev) => (prev === job.id ? null : job.id))
                    }
                    className={`rounded-2xl py-3 items-center ${
                      isDark ? "bg-neutral-800" : "bg-white"
                    } border ${isDark ? "border-neutral-700" : "border-neutral-200"}`}
                  >
                    <Text className={`${isDark ? "text-neutral-200" : "text-neutral-800"} font-satoshiMedium`}>
                      Negotiate Price
                    </Text>
                  </Pressable>

                  {pendingOffers[job.id] && pendingOffers[job.id].secondsLeft > 0 && (
                    <View className="mt-2">
                      <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                        Sent {formatFare(pendingOffers[job.id].price)}. Waiting for customer response:
                        {" "}{pendingOffers[job.id].secondsLeft}s
                      </Text>
                    </View>
                  )}

                  {pendingOffers[job.id] && pendingOffers[job.id].secondsLeft <= 0 && (
                    <View className="mt-2">
                      <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                        No response after 30s. You can accept the ride or send another offer.
                      </Text>
                    </View>
                  )}

                  {negotiatingJobId === job.id && (
                    <View
                      className={`mt-3 rounded-2xl p-3 border ${
                        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                      }`}
                    >
                      <Text className={`${isDark ? "text-neutral-200" : "text-neutral-800"} font-satoshiMedium`}>
                        Suggested offers
                      </Text>
                      <View className="flex-row flex-wrap gap-2 mt-2">
                        {getSuggestedOffers(job.fare).map((price) => (
                          <Pressable
                            key={price}
                            onPress={() => sendOffer(job.id, price)}
                            className="px-3 py-2 rounded-full bg-amber-100"
                          >
                            <Text className="text-[12px] font-satoshiBold text-amber-700">
                              {formatFare(price)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <View className="mt-3">
                        <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                          Or enter a custom amount
                        </Text>
                        <View
                          className={`mt-2 flex-row items-center rounded-2xl px-3 py-2 border ${
                            isDark ? "bg-neutral-950 border-neutral-800" : "bg-primary-50 border-neutral-200"
                          }`}
                        >
                          <Text className={`${isDark ? "text-neutral-300" : "text-neutral-700"} mr-2`}>₦</Text>
                          <TextInput
                            value={customOffer[job.id] || ""}
                            onChangeText={(text) =>
                              setCustomOffer((prev) => ({ ...prev, [job.id]: text.replace(/[^0-9]/g, "") }))
                            }
                            keyboardType="number-pad"
                            placeholder="Enter amount"
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            className={`flex-1 text-[14px] ${
                              isDark ? "text-white" : "text-neutral-900"
                            }`}
                          />
                        </View>
                        <Pressable
                          onPress={() => sendOffer(job.id, Number(customOffer[job.id]))}
                          className="mt-2 rounded-2xl py-3 items-center bg-primary"
                        >
                          <Text className="text-white font-satoshiBold">Send Offer</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))
        )}

        {canProgress && (
          <>
            <Text
              className={`text-[16px] font-satoshiBold mt-4 mb-3 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Active ride
            </Text>
            {jobs
              .filter((j) => j.status === "ACTIVE" || j.status === "IN_PROGRESS")
              .map((job) => (
                <View
                  key={job.id}
                  className={`rounded-3xl px-4 py-4 mb-3 border ${
                    isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-[13px] font-satoshiMedium ${
                        isDark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {job.id}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        job.status === "IN_PROGRESS" ? "bg-emerald-100" : "bg-amber-100"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-satoshiBold ${
                          job.status === "IN_PROGRESS" ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {job.status === "IN_PROGRESS" ? "In Progress" : "Active"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`mt-2 text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Pickup: {job.pickup}
                  </Text>
                  <Text
                    className={`mt-1 text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Dropoff: {job.dropoff}
                  </Text>
                  <View className="flex-row mt-3">
                    {job.status === "ACTIVE" ? (
                      <Pressable
                        onPress={() => startRide(job.id)}
                        className="flex-1 rounded-2xl py-3 items-center bg-primary"
                      >
                        <Text className="text-white font-satoshiBold">Start Ride</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => endRide(job.id)}
                        className="flex-1 rounded-2xl py-3 items-center bg-primary"
                      >
                        <Text className="text-white font-satoshiBold">End Ride</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
