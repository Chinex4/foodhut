import { fetchActiveCart } from "@/redux/cart/cart.thunks";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEnsureAuthenticated } from "@/hooks/useEnsureAuthenticated";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";

import CompletedTab from "@/components/orders/CompletedTab";
import MyCartsTab from "@/components/orders/MyCartsTab";
import OngoingTab from "@/components/orders/OngoingTab";
import SearchBar from "@/components/search/SearchBar";

type TabKey = "carts" | "ongoing" | "completed";

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { isAuthenticated, redirectToLogin } = useEnsureAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin]);

  const tabs = useMemo(
    () =>
      [
        { k: "carts" as const, t: "My Carts" },
        { k: "ongoing" as const, t: "Ongoing" },
        { k: "completed" as const, t: "Completed" },
      ] as const,
    []
  );

  const [tab, setTab] = useState<TabKey>("carts");
  const pagerRef = useRef<PagerView>(null);

  const tabIndex = tabs.findIndex((x) => x.k === tab);

  useEffect(() => {
    dispatch(fetchActiveCart());
    dispatch(fetchOrders({ page: 1, per_page: 50 }));
  }, [dispatch]);

  const goToTab = (next: TabKey) => {
    setTab(next);
    const index = tabs.findIndex((x) => x.k === next);
    pagerRef.current?.setPage(index);
  };

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
        {tabs.map(({ k, t }) => (
          <Pressable key={k} onPress={() => goToTab(k)}>
            <Text
              className={`text-[16px] text-center ${
                tab === k
                  ? "text-primary font-satoshiBold"
                  : isDark
                  ? "text-neutral-400 font-satoshi"
                  : "text-neutral-700 font-satoshi"
              }`}
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

      {/* Body (swipeable) */}
      <View className="flex-1">
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={tabIndex === -1 ? 0 : tabIndex}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setTab(tabs[index].k);
          }}
        >
          <View key="carts" style={{ flex: 1 }}>
            <MyCartsTab />
          </View>
          <View key="ongoing" style={{ flex: 1 }}>
            <OngoingTab />
          </View>
          <View key="completed" style={{ flex: 1 }}>
            <CompletedTab />
          </View>
        </PagerView>
      </View>
    </View>
  );
}
