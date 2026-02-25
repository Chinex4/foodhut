import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTopupLink } from "@/redux/wallet/wallet.thunks";
import { selectTopupStatus, selectTopupUrl } from "@/redux/wallet/wallet.selectors";
import { showError } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function KitchenTopupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const [amount, setAmount] = useState<string>("");

  const status = useAppSelector(selectTopupStatus);
  const url = useAppSelector(selectTopupUrl);

  const busy = status === "loading";
  const numeric = useMemo(() => Number(amount.replace(/[^0-9.]/g, "")), [amount]);
  const canTopup = !busy && numeric > 0;

  const handleTopup = async () => {
    try {
      await dispatch(
        createTopupLink({
          amount: Math.round(numeric),
          as_kitchen: true,
        })
      ).unwrap();
    } catch (e: any) {
      showError(e);
    }
  };

  useEffect(() => {
    const open = async () => {
      if (status === "succeeded" && url) {
        await WebBrowser.openBrowserAsync(url);
        router.back();
      }
    };
    open();
  }, [status, url, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-2 pb-3 flex-row items-center">
          <Pressable
            onPress={() => router.push("/kitchen/wallet")}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Top Up Wallet
          </Text>
        </View>

        <View className="flex-1 px-5 mt-2">
          <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Text className="text-[13px]" style={{ color: palette.textSecondary }}>
              Enter amount
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={palette.textMuted}
              className="mt-2 rounded-2xl px-4 py-3 text-[18px] font-satoshiBold"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textPrimary }}
            />

            <Text className="mt-4 text-[13px]" style={{ color: palette.textSecondary }}>
              Quick amounts
            </Text>
            <View className="flex-row flex-wrap mt-2">
              {QUICK_AMOUNTS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setAmount(String(item))}
                  className="rounded-full px-4 py-2 mr-2 mb-2"
                  style={{
                    backgroundColor:
                      numeric === item ? palette.accentSoft : palette.surfaceAlt,
                    borderWidth: 1,
                    borderColor:
                      numeric === item ? palette.accentStrong : palette.border,
                  }}
                >
                  <Text
                    className="font-satoshiBold text-[12px]"
                    style={{ color: numeric === item ? palette.accentStrong : palette.textSecondary }}
                  >
                    ₦{item.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View className="px-5 pb-6">
          <Pressable
            disabled={!canTopup}
            onPress={handleTopup}
            className="rounded-2xl py-4 items-center justify-center"
            style={{ backgroundColor: canTopup ? palette.accent : palette.textMuted }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold text-[16px]">Continue</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
