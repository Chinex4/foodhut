import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/store/hooks";
import { selectMe } from "@/redux/users/users.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import * as MailComposer from "expo-mail-composer";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

type FaqItem = { id: string; title: string; answer: string };

const FAQS: FaqItem[] = [
  {
    id: "surge-fee",
    title: "What is Surge Fee?",
    answer:
      "Surge Fee is a small, time-bound price adjustment added during peak hours to keep deliveries fast. It goes directly toward compensating riders and kitchens for the extra demand.",
  },
  {
    id: "service-fee",
    title: "What is Service Fee?",
    answer:
      "Service Fee helps us run the FoodHut platform—payments, support, fraud prevention, and app infrastructure. It is shown clearly at checkout before you pay.",
  },
  {
    id: "delivery-times",
    title: "How long does delivery take?",
    answer:
      "Most deliveries arrive in 25–45 minutes. Exact estimates depend on kitchen prep time, distance, and rider availability. Your live ETA updates in the order tracker.",
  },
  {
    id: "refund-policy",
    title: "Refund Policy",
    answer:
      "If an order is missing items, arrives excessively late, or is not as described, request help within 24 hours via Support → ‘Send us a message’. Eligible cases are refunded to your original payment method or to your FoodHut wallet.",
  },
  {
    id: "wallet-withdrawal",
    title: "How do I withdraw the funds in my wallet?",
    answer:
      "Go to Wallet → Withdraw, add a verified bank account, enter an amount, and confirm. Withdrawals typically settle within minutes to 24 hours depending on your bank.",
  },
  {
    id: "edit-address",
    title: "Can I change my delivery address after placing an order?",
    answer:
      "Yes, if the kitchen hasn’t started cooking. Open the order → Options → ‘Change address’. For significant changes, support may cancel and re-place the order to avoid delays.",
  },
  {
    id: "cancel-order",
    title: "Can I cancel my order?",
    answer:
      "You can cancel before the kitchen starts cooking at no cost. After cooking starts, a small cancellation fee may apply to cover preparation costs.",
  },
  {
    id: "tips",
    title: "How do tips work?",
    answer:
      "100% of your optional tip goes to your rider. You can tip at checkout or after delivery from the order receipt.",
  },
  {
    id: "kitchen-onboarding",
    title: "I want to sell on FoodHut as a kitchen",
    answer:
      "From the role selector, choose ‘Sign on as Kitchen’. Complete the form (name, type, address, phone, opening/closing times, prep & delivery times). Our team may request verification documents.",
  },
  {
    id: "rider-onboarding",
    title: "I want to deliver as a rider",
    answer:
      "From the role selector, choose ‘Sign on as Rider’. Provide your full name, email, and phone number. You’ll receive next steps for verification (ID, bike details, etc.).",
  },
  {
    id: "data-privacy",
    title: "How does FoodHut protect my data?",
    answer:
      "We use bank-grade encryption, never sell personal data, and follow strict access controls. Only essential info (like address/phone) is shared with kitchens/riders to fulfill your order.",
  },
];

function AccordionItem({
  item,
  expanded,
  onToggle,
  isDark,
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  return (
    <View className="mb-3">
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "#eee" }}
        className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
        }`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text
          className={`font-satoshi flex-1 pr-4 ${
            isDark ? "text-neutral-100" : "text-neutral-900"
          }`}
        >
          {item.title}
        </Text>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>

      {expanded && (
        <View
          className={`px-4 pt-3 pb-4 rounded-2xl -mt-2 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
        >
          <Text
            className={`font-satoshi leading-6 ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            {item.answer}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SupportScreen() {
  const me = useAppSelector(selectMe);
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Enable Android layout animations
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const animate = () => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: "opacity",
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: "opacity",
      },
    });
  };

  const toggle = (id: string) => {
    animate();
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openWhatsApp = async () => {
    const url = "https://wa.me/2348090000000?text=Hi%20FoodHut%20support";
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    Alert.alert("WhatsApp not available", "Please try email or phone.");
  };

  const openCall = async () => {
    const url = "tel:+2348090000000";
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    Alert.alert("Call not available", "Please reach us via WhatsApp or email.");
  };

  const openMail = async () => {
    const email = "support@foodhut.co";
    const subject = "Support Request";
    const body = `Hello FoodHut Support,

My name is ${[me?.first_name, me?.last_name].filter(Boolean).join(" ") || "—"}.

`;

    try {
      // Preferred: Expo MailComposer
      const available = await MailComposer.isAvailableAsync();
      if (available) {
        await MailComposer.composeAsync({
          recipients: [email],
          subject,
          body,
        });
        return;
      }

      // Fallback: mailto
      const url = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }

      // Final fallback: copy address
      Alert.alert(
        "Email app not available",
        "We couldn’t open your email app on this device.",
        [
          {
            text: "Copy address",
            onPress: () => Clipboard.setStringAsync(email),
          },
          { text: "OK" },
        ]
      );
    } catch {
      Alert.alert(
        "Couldn’t open email",
        "Please try again or copy the address: support@foodhut.co",
        [
          {
            text: "Copy address",
            onPress: () => Clipboard.setStringAsync(email),
          },
          { text: "OK" },
        ]
      );
    }
  };

  const cardBase = `rounded-3xl p-4 border ${
    isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
  }`;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="px-5 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View
          className={`rounded-3xl p-5 border ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
          }`}
          style={{
            shadowOpacity: isDark ? 0 : 0.06,
            shadowRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className={`text-[20px] font-satoshiBold ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Hello {me?.first_name || "there"} 👋
              </Text>
              <Text
                className={`mt-1 text-[10px] ${
                  isDark ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                We’re here to help with orders, payments, and deliveries.
              </Text>
            </View>
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                isDark ? "bg-neutral-800" : "bg-primary-50"
              }`}
            >
              <Ionicons name="headset-outline" size={22} color="#F59E0B" />
            </View>
          </View>
        </View>

        {/* Contact */}
        <Text
          className={`mt-8 mb-3 font-satoshi ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Contact us
        </Text>
        <View className="space-y-3">
          <Pressable onPress={openWhatsApp} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    WhatsApp
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    Chat with our support team instantly
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>

          <Pressable onPress={openCall} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="call-outline" size={18} color="#F59E0B" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    Call Support
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    +234 809 000 0000
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>

          <Pressable onPress={openMail} className={cardBase}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isDark ? "bg-neutral-800" : "bg-primary-50"
                  }`}
                >
                  <Ionicons name="mail-outline" size={18} color="#3B82F6" />
                </View>
                <View className="ml-3">
                  <Text
                    className={`font-satoshiMedium ${
                      isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    Email us
                  </Text>
                  <Text
                    className={`text-[12px] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    support@foodhut.co
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>

        {/* FAQ Section */}
        <Text
          className={`mt-8 mb-2 font-satoshi ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Frequently Asked Questions
        </Text>
        <View>
          {FAQS.map((f) => (
            <AccordionItem
              key={f.id}
              item={f}
              expanded={openIds.has(f.id)}
              onToggle={() => toggle(f.id)}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-6 right-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open orders"
          onPress={() => router.push("/users/(tabs)/orders")}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
          className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-lg"
          style={Platform.select({ android: { elevation: 8 } })}
        >
          <Ionicons name="cart" size={30} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
