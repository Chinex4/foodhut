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
import * as MailComposer from "expo-mail-composer";
import * as Clipboard from "expo-clipboard";

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
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="mb-3">
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "#eee" }}
        className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl border border-neutral-100"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text className="text-neutral-900 font-satoshi flex-1 pr-4">
          {item.title}
        </Text>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>

      {expanded && (
        <View className="px-4 pt-3 pb-4 bg-white rounded-2xl -mt-2 border border-neutral-100">
          <Text className="text-neutral-600 font-satoshi leading-6">
            {item.answer}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SupportScreen() {
  const me = useAppSelector(selectMe);
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
    } catch (e) {
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
            <AccordionItem
              key={f.id}
              item={f}
              expanded={openIds.has(f.id)}
              onToggle={() => toggle(f.id)}
            />
          ))}
        </View>

        {/* Single CTA → Email client */}
        <View className="mt-10">
          <Pressable
            onPress={openMail}
            className="flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl border border-neutral-100"
          >
            <View>
              <Text className="text-neutral-900 font-satoshiMedium">
                Send us a message
              </Text>
              <Text className="text-neutral-500 font-satoshi mt-1">
                Opens your email app → support@foodhut.co
              </Text>
            </View>
            <Ionicons name="mail-outline" size={20} color="#0F172A" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
