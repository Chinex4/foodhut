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
        await new Promise((r) => setTimeout(r, 3000));

        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (!isMounted) return;
        if (token) {
          router.replace("/users/(tabs)");
        } else {
          router.replace("/(auth)/login");
        }
      } catch {
        if (isMounted) router.replace("/(auth)/login");
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
