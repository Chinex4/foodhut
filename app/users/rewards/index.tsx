import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "@/components/ui/toast";
import {
  selectReferralsError,
  selectReferralsItems,
  selectReferralsStatus,
} from "@/redux/referrals/referrals.selectors";
import { fetchReferrals } from "@/redux/referrals/referrals.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectMe } from "@/redux/users/users.selectors";
import { fetchMyProfile } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";

type Tab = "REFER" | "EARN";

export default function ReferralsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectMe);
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const referrals = useAppSelector(selectReferralsItems);
  const referralsStatus = useAppSelector(selectReferralsStatus);
  const referralsError = useAppSelector(selectReferralsError);
  const [tab, setTab] = useState<Tab>("REFER");

  useEffect(() => {
    if (!me) {
      dispatch(fetchMyProfile());
    }
    if (referralsStatus === "idle") {
      dispatch(fetchReferrals());
    }
  }, [dispatch, me, referralsStatus]);

  const code = me?.referral_code ?? referrals[0]?.code ?? "—";
  const link = useMemo(() => {
    if (!code || code === "—") return "—";
    return `https://www.foodhut.com/${code}`;
  }, [code]);

  const totalEarned = useMemo(
    () => referrals.reduce((sum, item) => sum + (Number(item.balance) || 0), 0),
    [referrals]
  );

  const copy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showSuccess("Copied to clipboard");
    } catch {
      showError("Failed to copy");
    }
  };

  const shareCode = async () => {
    if (!code || code === "—") return;
    try {
      await Share.share({
        message: `Use my FoodHut code ${code} and save on your first order! ${link}`,
      });
    } catch {
      // no-op
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.push("/users/(tabs)/profile")} className="mr-2">
            <Ionicons name="chevron-back" size={22} color={isDark ? "#E5E7EB" : "#0F172A"} />
          </Pressable>
          <View>
            <Text className={`text-[22px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Rewards
            </Text>
            <Text className={`mt-1 font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Refer friends and earn rewards
            </Text>
          </View>
        </View>

        <View className={`flex-row mt-4 ${isDark ? "bg-neutral-800" : "bg-neutral-200/60"} rounded-xl p-1`}>
          {(["REFER", "EARN"] as const).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${active ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-[13px] ${
                    active
                      ? "text-white font-satoshiBold"
                      : isDark
                        ? "text-neutral-300 font-satoshi"
                        : "text-neutral-600 font-satoshi"
                  }`}
                >
                  {key === "REFER" ? "Refer" : "Earn"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === "REFER" ? (
        <View className="px-5">
          <View className="items-center mt-6">
            <Image source={require("@/assets/images/giftbox.png")} className="w-24 h-24" />
            <Text className={`mt-2 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
              Refer & Earn
            </Text>
          </View>

          <View className="mt-6">
            <Text className={`mb-2 font-satoshi ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
              Referral Code
            </Text>
            <View className={`rounded-2xl px-3 py-4 flex-row items-center justify-between ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-neutral-100"}`}>
              <Text className={`flex-1 mr-3 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}>
                {code}
              </Text>
              <Pressable onPress={() => copy(code)} className="px-2 py-2">
                <Ionicons name="copy-outline" size={18} color={isDark ? "#E5E7EB" : "#0F172A"} />
              </Pressable>
            </View>
          </View>

          <View className="mt-4">
            <Text className={`mb-2 font-satoshi ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
              Referral Link
            </Text>
            <View className={`rounded-2xl px-3 py-4 flex-row items-center justify-between ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-neutral-100"}`}>
              <Text className={`flex-1 mr-3 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}>
                {link}
              </Text>
              <Pressable onPress={() => copy(link)} className="px-2 py-2">
                <Ionicons name="copy-outline" size={18} color={isDark ? "#E5E7EB" : "#0F172A"} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={shareCode}
            disabled={code === "—"}
            className="mt-5 bg-primary rounded-2xl py-4 items-center justify-center"
            style={{ opacity: code === "—" ? 0.6 : 1 }}
          >
            <Text className="text-white font-satoshiBold">Share Code</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1 px-5">
          <View className={`rounded-2xl p-5 mt-4 ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-neutral-900"}`}>
            <Text className="text-white/80 font-satoshi">
              Available Referral Earnings
            </Text>
            <Text className="text-white text-[24px] font-satoshiBold mt-1">
              {formatNGN(totalEarned)}
            </Text>
          </View>

          <FlatList
            data={referrals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 18 }}
            ListHeaderComponent={
              <View className="mb-2">
                <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                  Your Referrals
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className={`rounded-2xl border px-3 py-3 mb-3 flex-row items-center justify-between ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
                <View className="flex-1 pr-3">
                  <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {item.referred_id ? `Referred user #${item.referred_id.slice(0, 6)}` : "Pending referral"}
                  </Text>
                  <Text className={`text-[12px] font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Code: {item.code} • {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View>
                  <Text className={`text-[12px] font-satoshi self-end ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Earned
                  </Text>
                  <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {formatNGN(item.balance)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              referralsStatus === "loading" ? (
                <View className="items-center mt-8">
                  <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                    Loading referrals...
                  </Text>
                </View>
              ) : referralsError ? (
                <View className="items-center mt-8">
                  <Text className="text-red-500">{referralsError}</Text>
                </View>
              ) : (
                <View className="items-center mt-10">
                  <Image source={require("@/assets/images/empty-box.png")} className="w-28 h-28" />
                  <Text className={`mt-3 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Share your code!
                  </Text>
                  <Text className={`font-satoshi text-center px-8 mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    No referrals yet. Share your code and start earning rewards.
                  </Text>
                </View>
              )
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
