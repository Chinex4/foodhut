// app/users/referrals/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CachedImage from "@/components/ui/CachedImage";
import { showError, showSuccess } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { selectMe } from "@/redux/users/users.selectors";
import { useAppSelector } from "@/store/hooks";

type Tab = "REFER" | "EARN";

type Referral = {
  id: string;
  name: string;
  avatar?: string | null;
  joinedLabel: string;
  youEarned: number; // kobo-safe: store as minor, but here simple number in NGN
};

function Segmented({ tab, setTab, isDark }: { tab: Tab; setTab: (t: Tab) => void; isDark: boolean }) {
  return (
    <View className={`flex-row ${isDark ? "bg-neutral-800" : "bg-neutral-200/60"} rounded-xl p-1`}>
      <Pressable
        onPress={() => setTab("REFER")}
        className={`flex-1 py-2 rounded-lg items-center justify-center ${
          tab === "REFER" ? "bg-primary" : ""
        }`}
      >
        <Text
          className={`text-[13px] ${
            tab === "REFER"
              ? "text-white font-satoshiBold"
              : "text-neutral-600 font-satoshi"
          }`}
        >
          Refer
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setTab("EARN")}
        className={`flex-1 py-2 rounded-lg items-center justify-center ${
          tab === "EARN" ? "bg-primary" : ""
        }`}
      >
        <Text
          className={`text-[13px] ${
            tab === "EARN"
              ? "text-white font-satoshiBold"
              : "text-neutral-600 font-satoshi"
          }`}
        >
          Earn
        </Text>
      </Pressable>
    </View>
  );
}

function CopyField({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-neutral-800 font-satoshi">{label}</Text>
      <View className="bg-neutral-100 rounded-2xl px-3 py-4 flex-row items-center justify-between">
        <Text
          numberOfLines={1}
          className="flex-1 mr-3 text-neutral-900 font-satoshi"
        >
          {value}
        </Text>
        <Pressable onPress={onCopy} className="px-2 py-2">
          <Ionicons name="copy-outline" size={18} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}

function InfoAccordion({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
}) {
  return (
    <View className="mt-4 bg-white rounded-2xl border border-neutral-200">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-3 py-4"
      >
        <View className="flex-row items-center">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#0F172A"
          />
          <Text className="ml-2 font-satoshi">How you can earn</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#0F172A"
        />
      </Pressable>
      {open && (
        <View className="px-3 pb-4">
          <Text className="text-neutral-600 font-satoshi">
            • Share your code with friends{`\n`}• They get discounts on first
            order{`\n`}• You earn wallet credits after their first successful
            order
          </Text>
        </View>
      )}
    </View>
  );
}

function RewardTile({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-[#FFF5E6] border border-[#FFE7C2] rounded-xl px-3 py-3 flex-row items-center mb-3">
      {icon}
      <View className="ml-3">
        <Text className="text-neutral-900 font-satoshiMedium">{title}</Text>
        <Text className="text-neutral-600 text-[12px] font-satoshi">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export default function ReferralsScreen() {
  const router = useRouter();
  const me = useAppSelector(selectMe);
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [tab, setTab] = useState<Tab>("REFER");
  const code = me?.referral_code ?? "—";
  const link = useMemo(() => {
    if (!code || code === "—") return "—";
    return `https://www.foodhut.com/${code}`;
  }, [code]);

  const [showRewards, setShowRewards] = useState(true);
  const [openInfo, setOpenInfo] = useState(false);

  // Replace with real referral balance & list when API is ready
  const balance = 5000; // NGN
  const referrals: Referral[] = []; // start empty; demo populated state below

  const copy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showSuccess("Copied to clipboard");
    } catch {
      showError("Failed to copy");
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Use my FoodHut code ${code} and save on your first order! ${link}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push("/users/(tabs)/profile")}
            className="mr-2"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <View>
            <Text className="text-[22px] font-satoshiBold text-neutral-900">
              Rewards
            </Text>
            <Text className="mt-1 text-neutral-600 font-satoshi">
              Earn rewards as you order! Save with coupons, wallet credits, and
              free treats
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Segmented tab={tab} setTab={setTab} isDark={isDark} />
        </View>
      </View>

      {/* REFER TAB */}
      {tab === "REFER" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-5"
        >
          {/* Optional rewards popover */}
          {showRewards && (
            <View
              className="relative bg-white rounded-2xl border border-neutral-200 p-4 mt-4"
              style={{
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Pressable
                onPress={() => setShowRewards(false)}
                className="absolute right-2 top-2 p-1 rounded-full"
              >
                <Ionicons name="close" size={16} color="#0F172A" />
              </Pressable>

              <RewardTile
                icon={
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color="#0F172A"
                  />
                }
                title="Refer a friend"
                subtitle="Get ₦1000"
              />
              <RewardTile
                icon={
                  <Ionicons name="gift-outline" size={18} color="#0F172A" />
                }
                title="First Order bonus"
                subtitle="Free delivery + ₦500 wallet credit"
              />
              <RewardTile
                icon={
                  <Ionicons name="beer-outline" size={18} color="#0F172A" />
                }
                title="Order 5 times"
                subtitle="Get free drinks"
              />
            </View>
          )}

          {/* Illustration */}
          <View className="items-center mt-8">
            <Image
              source={require("@/assets/images/giftbox.png")}
              className="w-24 h-24"
            />
            <Text className="mt-2 font-satoshiMedium text-neutral-900">
              Refer & Earn
            </Text>
          </View>

          {/* Code + Link */}
          <CopyField
            label="Referral Code"
            value={code}
            onCopy={() => copy(code)}
          />
          <CopyField
            label="Referral Link"
            value={link}
            onCopy={() => copy(link)}
          />

          {/* Share */}
          <Pressable
            onPress={shareCode}
            className="mt-5 bg-primary rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white font-satoshiBold">Share Code</Text>
          </Pressable>
        </ScrollView>
      ) : (
        // EARN TAB
        <View className="flex-1 px-5">
          <FlatList
            data={referrals}
            keyExtractor={(x) => x.id}
            ListHeaderComponent={
              <View>
                {/* Balance card */}
                <View className="bg-neutral-900 rounded-2xl p-5 mt-4">
                  <Text className="text-white/80 font-satoshi">
                    Available Balance
                  </Text>
                  <Text className="text-white text-[24px] font-satoshiBold mt-1">
                    NGN {balance.toLocaleString()}
                  </Text>
                  {/* decorative squiggle can be an Image background if you have it */}
                </View>

                {/* How you can earn (accordion) */}
                <InfoAccordion open={openInfo} setOpen={setOpenInfo} />

                {/* Section header */}
                <View className="flex-row items-center justify-between mt-6 mb-2">
                  <Text className="text-neutral-900 font-satoshiBold">
                    Your Referrals
                  </Text>
                  <Pressable className="px-2 py-1">
                    <Text className="text-primary font-satoshiMedium">
                      See all
                    </Text>
                  </Pressable>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl border border-neutral-100 px-3 py-3 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <CachedImage
                    uri={item.avatar || undefined}
                    fallback={
                      <Image
                        source={require("@/assets/images/avatar.png")}
                        className="w-8 h-8 rounded-full bg-neutral-200"
                      />
                    }
                    className="w-8 h-8 rounded-full bg-neutral-200"
                  />
                  <View className="ml-3">
                    <Text className="text-neutral-900 font-satoshiMedium">
                      {item.name}
                    </Text>
                    <Text className="text-neutral-500 text-[12px] font-satoshi">
                      {item.joinedLabel}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text className="text-neutral-500 text-[12px] font-satoshi self-end">
                    You Earned
                  </Text>
                  <Text className="text-neutral-900 font-satoshiBold">
                    ₦{item.youEarned.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Image
                  source={require("@/assets/images/empty-box.png")}
                  className="w-28 h-28"
                />
                <Text className="mt-3 text-neutral-900 font-satoshiMedium">
                  Share your code!
                </Text>
                <Text className="text-neutral-500 font-satoshi text-center px-8 mt-1">
                  No one has used your referral code yet. Share it now and start
                  earning rewards.
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
