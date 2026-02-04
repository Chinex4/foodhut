// app/users/(tabs)/orders/MyCartsTab.tsx
import { showError, showSuccess } from "@/components/ui/toast";
import {
  selectAwaitingPaymentOrders,
  selectOrdersListStatus,
} from "@/redux/orders/orders.selectors";
import {
  selectCartFetchStatus,
  selectCartItemsForKitchen,
  selectCartKitchenIds,
} from "@/redux/cart/cart.selectors";
import { clearKitchenCart } from "@/redux/cart/cart.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import type { Order } from "@/redux/orders/orders.types";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import CachedImageView from "../ui/CachedImage";
import OrderCard from "./OrderCard";

type CartListItem = { type: "cart"; kitchenId: string };
type AwaitingListItem = { type: "order"; order: Order };
type ListItem = CartListItem | AwaitingListItem;

type CartSection = { key: "carts"; title: null; data: CartListItem[] };
type AwaitingSection = {
  key: "awaiting-payment";
  title: string;
  data: AwaitingListItem[];
};
type ListSection = CartSection | AwaitingSection;

function KitchenCartCard({
  kitchenId,
  isDark,
}: {
  kitchenId: string;
  isDark: boolean;
}) {
  const dispatch = useAppDispatch();

  const group = useAppSelector((s) => s.cart.byKitchenId[kitchenId]);
  const items = useAppSelector(selectCartItemsForKitchen(kitchenId));

  // If for some reason this kitchen no longer exists in cart, don't render
  if (!group) {
    return null;
  }

  const itemCount = items.reduce((t, it) => t + (it.quantity ?? 0), 0);
  const subTotal = items.reduce(
    (t, it) => t + Number(it.meal.price) * (it.quantity ?? 0),
    0
  );

  // ✅ Strong guard on cover image
  const rawCover = group.kitchen?.cover_image;
  const coverCandidate =
    typeof rawCover === "string"
      ? rawCover
      : rawCover && typeof rawCover === "object"
        ? (rawCover.url ?? null)
        : null;
  const coverUri =
    typeof coverCandidate === "string" && coverCandidate.trim().length > 0
      ? coverCandidate
      : null;

  const kitchenName = group.kitchen?.name ?? "Kitchen";

  const onClear = async () => {
    try {
      const res = await dispatch(clearKitchenCart(kitchenId)).unwrap();
      showSuccess(res.message || "Cleared");
    } catch (e: any) {
      showError(e);
    }
  };

  return (
    <View
      className={`rounded-3xl mx-4 mt-5 p-3 ${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-white border border-[#F2F2F2]"}`}
      style={{
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      {/* header row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <CachedImageView
            uri={coverUri}
            fallback={
              <Image
                source={require("@/assets/images/food1.png")}
                className={`w-8 h-8 rounded-lg ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
              />
            }
            className={`w-8 h-8 rounded-lg ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
          />
          <View className="ml-2">
            <Text
              className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              {kitchenName}
            </Text>
            <Text
              className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
            >
              {itemCount} item{itemCount === 1 ? "" : "s"} •{" "}
              {formatNGN(subTotal)}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-up"
          size={18}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      </View>

      {/* CTA row */}
      <View className="mt-4 flex-row items-center">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/users/checkout",
              params: { kitchen_id: kitchenId },
            })
          }
          className="flex-1 bg-primary rounded-2xl py-4 items-center justify-center mr-3"
        >
          <Text className="text-white font-satoshiBold">View Order</Text>
        </Pressable>

        <Pressable
          onPress={onClear}
          className={`px-5 py-4 rounded-2xl ${isDark ? "bg-neutral-800" : "bg-[#FFE8C2]"}`}
        >
          <Text
            className={`font-satoshiMedium ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          >
            Clear
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function MyCartsTab() {
  const status = useAppSelector(selectCartFetchStatus);
  const kitchenIds = useAppSelector(selectCartKitchenIds);
  const awaitingPaymentOrders = useAppSelector(selectAwaitingPaymentOrders);
  const ordersStatus = useAppSelector(selectOrdersListStatus);
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const cartItems: CartListItem[] = kitchenIds.map((kitchenId) => ({
    type: "cart",
    kitchenId,
  }));
  const awaitingItems: AwaitingListItem[] = awaitingPaymentOrders.map(
    (order) => ({
      type: "order",
      order,
    })
  );

  const sections: ListSection[] = [
    ...(cartItems.length
      ? ([{ key: "carts", title: null, data: cartItems }] as const)
      : []),
    ...(awaitingItems.length
      ? ([
          {
            key: "awaiting-payment",
            title: "Awaiting payment",
            data: awaitingItems,
          },
        ] as const)
      : []),
  ];

  if (status === "loading") {
    return <ActivityIndicator style={{ marginTop: 160 }} color={"#ffa800"} />;
  }

  if (!sections.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text
          className={isDark ? "text-neutral-400 mt-4" : "text-neutral-500 mt-4"}
        >
          Your tray is empty, we are waiting for your orders
        </Text>
      </View>
    );
  }

  const renderSectionHeader = ({ section }: { section: ListSection }) => {
    if (!section.title) return null;
    return (
      <View
        className={`px-5 pt-6 pb-3 ${isDark ? "bg-neutral-950" : "bg-[#FFF8EC]"}`}
      >
        <Text
          className={`text-base font-satoshiBold ${
            isDark ? "text-neutral-200" : "text-neutral-900"
          }`}
        >
          {section.title}
        </Text>
        {section.key === "awaiting-payment" && ordersStatus === "loading" && (
          <ActivityIndicator className="mt-2" size="small" color="#ffa800" />
        )}
        {section.key === "awaiting-payment" && ordersStatus === "failed" && (
          <Text
            className={`text-[12px] mt-1 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            Failed to refresh pending orders.
          </Text>
        )}
      </View>
    );
  };

  return (
    <SectionList<ListItem, ListSection>
      sections={sections}
      keyExtractor={(item) =>
        item.type === "cart" ? item.kitchenId : item.order.id
      }
      renderSectionHeader={renderSectionHeader}
      renderItem={({ item }) =>
        item.type === "cart" ? (
          <KitchenCartCard kitchenId={item.kitchenId} isDark={isDark} />
        ) : (
          <OrderCard order={item.order} isDark={isDark} />
        )
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    />
  );
}
