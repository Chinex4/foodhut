import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";

import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showError, showSuccess } from "@/components/ui/toast";

const DEFAULT_REGION = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function RiderLiveMapScreen() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [broadcasting, setBroadcasting] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          showError("Location permission denied");
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        setRegion((prev) => ({
          ...prev,
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        }));

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 4000,
            distanceInterval: 8,
          },
          (loc) => {
            if (!mounted) return;
            setRegion((prev) => ({
              ...prev,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }));
          }
        );
      } catch (err: any) {
        showError(err?.message || "Unable to access location");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    startTracking();
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-4 pb-2">
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Live Map
        </Text>
        <Text className={`text-[12px] font-satoshi mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Track your live location and share with customers.
        </Text>
      </View>

      <View className="flex-1 px-5 pb-5">
        <View
          className={`flex-1 rounded-3xl overflow-hidden border items-center justify-center ${
            isDark ? "border-neutral-800" : "border-neutral-100"
          }`}
        >
          <Text className={`font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
            Map temporarily unavailable
          </Text>
          <Text className={`mt-1 text-[12px] font-satoshi ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
            Your location is still being tracked.
          </Text>
          <Text className={`mt-1 text-[11px] font-satoshi ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
            {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
          {loading && (
            <View className="absolute inset-0 items-center justify-center bg-black/20">
              <Text className="text-white font-satoshiMedium">Locating…</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <Pressable
            onPress={() => {
              setRegion(DEFAULT_REGION);
              showSuccess("Centered map");
            }}
            className={`flex-1 mr-3 rounded-2xl py-3 items-center border ${
              isDark ? "border-neutral-700" : "border-neutral-200"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="locate-outline"
                size={18}
                color={isDark ? "#E5E7EB" : "#111827"}
              />
              <Text className={`ml-2 font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                Re-center
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              setBroadcasting((prev) => !prev);
              showSuccess(
                !broadcasting ? "Live location shared" : "Broadcast paused"
              );
            }}
            className={`flex-1 rounded-2xl py-3 items-center ${
              broadcasting ? "bg-primary" : isDark ? "bg-neutral-800" : "bg-neutral-200"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={broadcasting ? "radio-outline" : "pause-outline"}
                size={18}
                color={broadcasting ? "#fff" : isDark ? "#E5E7EB" : "#111827"}
              />
              <Text
                className={`ml-2 font-satoshiMedium ${
                  broadcasting ? "text-white" : isDark ? "text-neutral-100" : "text-neutral-900"
                }`}
              >
                {broadcasting ? "Broadcast On" : "Broadcast Off"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
