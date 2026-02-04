// app/splash.tsx (your current file)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import { STORAGE_KEYS } from "@/storage/keys";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const go = async () => {
      try {
        // tiny splash hold
        await new Promise((r) => setTimeout(r, 1200));

        const [token, hasOnboarded] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        ]);

        if (!isMounted) return;

        if (token) {
          router.replace("/users/(tabs)");
        } else if (!hasOnboarded) {
          router.replace("/onboarding");
        } else {
          router.replace("/users/(tabs)");
        }
      } catch {
        if (isMounted) router.replace("/users/(tabs)");
      }
    };

    go();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../assets/images/logo-transparent.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffa800",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 200, height: 200, resizeMode: "contain" },
});
