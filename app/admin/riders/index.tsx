import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { VendorRiderListScreen } from "@/components/admin/VendorRiderList";

export default function RidersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <VendorRiderListScreen title="Riders" initialMode="riders" />
    </SafeAreaView>
  );
}
