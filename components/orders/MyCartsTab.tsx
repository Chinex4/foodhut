// app/users/(tabs)/orders/MyCartsTab.tsx
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartFetchStatus,
  selectCartKitchenIds,
  selectCartItemsForKitchen,
} from "@/redux/cart/cart.selectors";
import { clearKitchenCart } from "@/redux/cart/cart.thunks";
import { formatNGN } from "@/utils/money";
import { showError, showSuccess } from "@/components/ui/toast";

function KitchenCartCard({ kitchenId }: { kitchenId: string }) {
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
  const coverUri =
    typeof rawCover === "string" && rawCover.trim().length > 0
      ? rawCover
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
      className="bg-white rounded-3xl mx-4 mt-5 p-3"
      style={{
        borderColor: "#F2F2F2",
        borderWidth: 1,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      {/* header row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={
              coverUri
                ? { uri: coverUri }
                : require("@/assets/images/logo-transparent.png")
            }
            className="w-8 h-8 rounded-lg bg-neutral-100"
            resizeMode="cover"
          />
          <View className="ml-2">
            <Text className="font-satoshiBold text-neutral-900">
              {kitchenName}
            </Text>
            <Text className="text-[12px] text-neutral-500">
              {itemCount} item{itemCount === 1 ? "" : "s"} •{" "}
              {formatNGN(subTotal)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-up" size={18} color="#9CA3AF" />
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
          className="px-5 py-4 rounded-2xl bg-[#FFE8C2]"
        >
          <Text className="font-satoshiMedium text-neutral-900">Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function MyCartsTab() {
  const status = useAppSelector(selectCartFetchStatus);
  const kitchenIds = useAppSelector(selectCartKitchenIds);

  if (status === "loading") {
    return <ActivityIndicator style={{ marginTop: 160 }} color={"#ffa800"} />;
  }
  if (!kitchenIds.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text className="text-neutral-500 mt-4">
          Your tray is empty, we are waiting for your orders
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={kitchenIds}
      keyExtractor={(id) => id}
      renderItem={({ item }) => <KitchenCartCard kitchenId={item} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}
