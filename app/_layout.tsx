import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Appearance, Modal, Pressable, Text, View } from "react-native";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";

import { store } from "@/store";
import { attachStore } from "@/api/axios";
import { toastConfig, TOAST_BOTTOM_OFFSET } from "@/components/ui/toast";

import { dismissSessionExpired, hydrateFromStorage } from "@/redux/auth/auth.slice";
import { getStoredAuth } from "@/storage/auth";
import { selectSessionExpired } from "@/redux/auth/auth.selectors";

import "../global.css";
import { useRegisterPushToken } from "@/hooks/useRegisterFcmToken";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadThemePreference } from "@/redux/theme/theme.slice";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if already prevented
});

attachStore(store);

function PushTokenRegistrar() {
  // this now runs INSIDE the Provider
  useRegisterPushToken();
  return null;
}

function ThemeHydrator() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    dispatch(loadThemePreference());
  }, [dispatch]);

  useEffect(() => {
    Appearance.setColorScheme?.(mode as any);
  }, [mode]);

  return null;
}

function SessionExpiredModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const visible = useAppSelector(selectSessionExpired);
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const goToLogin = () => {
    dispatch(dismissSessionExpired());
    router.replace("/(auth)/login");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={goToLogin}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View
          className={`w-full rounded-3xl p-5 ${
            isDark ? "bg-neutral-900 border border-neutral-800" : "bg-white"
          }`}
        >
          <Text className={`text-[20px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Session expired
          </Text>
          <Text className={`mt-2 text-[14px] leading-6 font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
            Please log in again to continue using your account.
          </Text>
          <Pressable onPress={goToLogin} className="mt-5 rounded-2xl bg-primary py-4 items-center">
            <Text className="text-white font-satoshiBold text-[15px]">Login</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/Satoshi-Regular.otf"),
    "Satoshi-Black": require("../assets/fonts/Satoshi-Black.otf"),
    "Satoshi-BlackItalic": require("../assets/fonts/Satoshi-BlackItalic.otf"),
    "Satoshi-Italic": require("../assets/fonts/Satoshi-Italic.otf"),
    "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.otf"),
    "Satoshi-MediumItalic": require("../assets/fonts/Satoshi-MediumItalic.otf"),
    "Satoshi-Light": require("../assets/fonts/Satoshi-Light.otf"),
    "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.otf"),
  });


  useEffect(() => {
    (async () => {
      try {
        if (!fontsLoaded) return;

        const auth = await getStoredAuth();
        store.dispatch(hydrateFromStorage(auth as any));
      } catch {
        // no-op
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <ThemeHydrator />
      <PushTokenRegistrar />
      <SessionExpiredModal />
      <View style={{ flex: 1 }}>
        <Slot />
        <Toast
          config={toastConfig}
          position="bottom"
          bottomOffset={TOAST_BOTTOM_OFFSET}
          visibilityTime={3000}
        />
      </View>
    </Provider>
  );
}
