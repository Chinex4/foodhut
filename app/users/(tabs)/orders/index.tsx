import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Platform } from "react-native";
import { Tabs as RN } from "react-native-collapsible-tab-view";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchActiveCart } from "@/redux/cart/cart.thunks";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { selectOrdersListStatus } from "@/redux/orders/orders.selectors";

import MyCartsTab from "@/components/orders/MyCartsTab";
import OngoingTab from "@/components/orders/OngoingTab";
import CompletedTab from "@/components/orders/CompletedTab";
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchBar from "@/components/search/SearchBar";

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"carts" | "ongoing" | "completed">("carts");

  useEffect(() => {
    dispatch(fetchActiveCart());
    dispatch(fetchOrders({ page: 1, per_page: 50 }));
  }, [dispatch]);

  return (
    <View className="flex-1 bg-[#FFF8EC]">
      {/* search */}
      <View
        style={{ marginTop: Platform.select({ android: 60, ios: 80 }) }}
        className="px-5"
      >
        <SearchBar className="mt-4" />
      </View>

      {/* Tabs header */}
      <View className="mt-4 flex-row items-center justify-around">
        {[
          { k: "carts", t: "My Carts" },
          { k: "ongoing", t: "Ongoing" },
          { k: "completed", t: "Completed" },
        ].map(({ k, t }) => (
          <Pressable key={k} onPress={() => setTab(k as any)}>
            <Text
              className={`text-[16px] text-center ${tab === k ? "text-primary font-satoshiBold" : "text-neutral-700 font-satoshi"}`}
            >
              {t}
            </Text>
            {tab === k ? (
              <View
                className="h-0.5 bg-primary mt-2 rounded-full"
                style={{ width: 90 }}
              />
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* Body */}
      {tab === "carts" && <MyCartsTab />}
      {tab === "ongoing" && <OngoingTab />}
      {tab === "completed" && <CompletedTab />}
    </View>
  );
}
