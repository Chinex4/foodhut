import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  selectDeliveries,
  selectLogisticsCompanies,
  selectLogisticsRiders,
  selectLogisticsStatus,
} from "@/redux/logistics/logistics.selectors";
import {
  fetchDeliveries,
  fetchLogisticsCompanies,
  fetchLogisticsRiders,
  updateRiderStatus,
  verifyRiderKyc,
} from "@/redux/logistics/logistics.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showError, showSuccess } from "@/components/ui/toast";

export default function AdminLogisticsScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const status = useAppSelector(selectLogisticsStatus);
  const riders = useAppSelector(selectLogisticsRiders);
  const companies = useAppSelector(selectLogisticsCompanies);
  const deliveries = useAppSelector(selectDeliveries);

  const load = () => {
    dispatch(fetchLogisticsRiders({ page: 1, per_page: 50 }));
    dispatch(fetchLogisticsCompanies({ page: 1, per_page: 50 }));
    dispatch(fetchDeliveries({ page: 1, per_page: 50 }));
  };

  useEffect(load, [dispatch]);

  const toggleBlock = async (riderId: string, is_available: boolean, is_blocked: boolean) => {
    try {
      await dispatch(
        updateRiderStatus({ rider_id: riderId, is_available, is_blocked: !is_blocked })
      ).unwrap();
      showSuccess("Rider status updated");
    } catch (error: any) {
      showError(error);
    }
  };

  const verify = async (kycId: string, verification_status: "VERIFIED" | "REJECTED") => {
    try {
      await dispatch(verifyRiderKyc({ kyc_id: kycId, verification_status })).unwrap();
      showSuccess("KYC updated");
    } catch (error: any) {
      showError(error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-3 pb-4 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color={isDark ? "#E5E7EB" : "#111827"} />
        </Pressable>
        <Text className={`text-[22px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Logistics
        </Text>
      </View>

      {status === "loading" && riders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffa800" />
        </View>
      ) : (
        <FlatList
          data={riders}
          onRefresh={load}
          refreshing={status === "loading"}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListHeaderComponent={
            <View className="mb-5">
              <View className="flex-row gap-3">
                {[
                  { label: "Companies", value: companies.length },
                  { label: "Riders", value: riders.length },
                  { label: "Deliveries", value: deliveries.length },
                ].map((item) => (
                  <View
                    key={item.label}
                    className={`flex-1 rounded-2xl p-3 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                  >
                    <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>{item.label}</Text>
                    <Text className={`mt-1 text-[20px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className={`mt-6 text-[16px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                Riders
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className={`rounded-2xl p-4 mb-3 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {item.user?.first_name || "Rider"} {item.user?.last_name || ""}
                  </Text>
                  <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                    {item.user?.email || item.id}
                  </Text>
                </View>
                <Text className={`font-satoshiBold ${item.is_blocked ? "text-red-500" : "text-emerald-500"}`}>
                  {item.is_blocked ? "Blocked" : item.is_available ? "Available" : "Offline"}
                </Text>
              </View>
              <View className="flex-row mt-3">
                <Pressable
                  onPress={() => toggleBlock(item.id, item.is_available, item.is_blocked)}
                  className={`flex-1 rounded-xl py-3 items-center mr-2 ${item.is_blocked ? "bg-emerald-600" : "bg-red-500"}`}
                >
                  <Text className="text-white font-satoshiBold">{item.is_blocked ? "Unblock" : "Block"}</Text>
                </Pressable>
                {item.kyc?.id && item.kyc.verification_status === "PENDING" ? (
                  <>
                    <Pressable
                      onPress={() => verify(item.kyc!.id, "VERIFIED")}
                      className="flex-1 rounded-xl py-3 items-center bg-primary mr-2"
                    >
                      <Text className="text-white font-satoshiBold">Verify</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => verify(item.kyc!.id, "REJECTED")}
                      className={`flex-1 rounded-xl py-3 items-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                    >
                      <Text className={isDark ? "text-neutral-200" : "text-neutral-700"}>Reject</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
