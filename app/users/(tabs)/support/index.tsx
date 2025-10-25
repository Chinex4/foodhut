import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectMe } from "@/redux/users/users.selectors";

type FaqItem = { id: string; title: string };

const FAQS: FaqItem[] = [
  { id: "surge-fee", title: "What is Surge Fee?" },
  { id: "service-fee", title: "What is Service Fee?" },
  { id: "refund-policy", title: "Refund Policy" },
  {
    id: "wallet-withdrawal",
    title: "How do I withdraw the funds in my wallet?",
  },
];

function Row({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl mb-3 border border-neutral-100"
      android_ripple={{ color: "#eee" }}
    >
      <Text className="text-neutral-900 font-satoshi">{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function SupportScreen() {
  const router = useRouter();
  const me = useAppSelector(selectMe);

  const openMail = () => {
    const subject = encodeURIComponent("Support Request");
    const body = encodeURIComponent(
      `Hello FoodHut Support,\n\nMy name is ${[me?.first_name, me?.last_name].filter(Boolean).join(" ") || "—"}.\n\n`
    );
    Linking.openURL(
      `mailto:support@foodhut.com?subject=${subject}&body=${body}`
    );
  };

  const openChat = () => {
    // route to your in-app chat / messaging thread
    // router.push("/users/support/chat");
  };

  const openFaq = (id: string) => {
    // route to a detail or a web FAQ page
    // router.push(`/users/support/faq/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-5 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Greeting */}
        <Text className="text-[20px] font-satoshiBold text-neutral-900">
          Hello {me?.first_name || "there"} <Text>👋</Text>
        </Text>
        <Text className="mt-1 text-neutral-600 font-satoshi">
          Where do you need help?
        </Text>

        {/* FAQ Section */}
        <Text className="mt-6 mb-2 text-neutral-500 font-satoshi">
          Frequently Asked Questions
        </Text>
        <View>
          {FAQS.map((f) => (
            <Row key={f.id} title={f.title} onPress={() => openFaq(f.id)} />
          ))}
        </View>

        {/* Contact blocks */}
        <View className="mt-8">
          <Text className="mb-3 text-neutral-500 font-satoshi">
            Send us a message
          </Text>
          <Pressable
            onPress={openChat}
            className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl border border-neutral-100"
          >
            <View>
              <Text className="text-neutral-900 font-satoshiMedium">
                Send us a message
              </Text>
              <Text className="text-neutral-500 font-satoshi mt-1">
                We are online now
              </Text>
            </View>
            <Ionicons name="paper-plane-outline" size={20} color="#0F172A" />
          </Pressable>

          <Text className="mt-6 mb-3 text-neutral-500 font-satoshi">
            Send us a mail now
          </Text>
          <Pressable
            onPress={openMail}
            className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl border border-neutral-100"
          >
            <View>
              <Text className="text-neutral-900 font-satoshiMedium">
                Send us a mail now
              </Text>
              <Text className="text-neutral-500 font-satoshi mt-1">
                Send us a mail and we will review it
              </Text>
            </View>
            <Ionicons name="mail-outline" size={20} color="#0F172A" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
