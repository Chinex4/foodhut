import { fetchActiveCart } from "@/redux/cart/cart.thunks";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import CompletedTab from "@/components/orders/CompletedTab";
import MyCartsTab from "@/components/orders/MyCartsTab";
import OngoingTab from "@/components/orders/OngoingTab";
import SearchBar from "@/components/search/SearchBar";

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [tab, setTab] = useState<"carts" | "ongoing" | "completed">("carts");

  useEffect(() => {
    dispatch(fetchActiveCart());
    dispatch(fetchOrders({ page: 1, per_page: 50 }));
  }, [dispatch]);

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-[#FFF8EC]"}`}>
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
              className={`text-[16px] text-center ${tab === k ? "text-primary font-satoshiBold" : isDark ? "text-neutral-400 font-satoshi" : "text-neutral-700 font-satoshi"}`}
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
