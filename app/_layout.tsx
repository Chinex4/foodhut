import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Appearance, View } from "react-native";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import { useColorScheme } from "nativewind";

import { store } from "@/store";
import { attachStore } from "@/api/axios";
import { toastConfig, TOAST_BOTTOM_OFFSET } from "@/components/ui/toast";

import { hydrateFromStorage } from "@/redux/auth/auth.slice";
import { getStoredAuth } from "@/storage/auth";

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
