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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartKitchenIds,
  selectCartItemsForKitchen,
  selectCartFetchStatus,
  selectCartSubtotal,
  selectCartTotalItems,
} from "@/redux/cart/cart.selectors";
import { removeCartItem, setCartItem } from "@/redux/cart/cart.thunks";
import { formatNGN } from "@/utils/money";
import { showError, showSuccess } from "@/components/ui/toast";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { router } from "expo-router";

function CartItemCard({
  id,
  name,
  cover,
  price,
  quantity,
  onClear,
  onChangeQty,
}: {
  id: string;
  name: string;
  cover?: string | null;
  price: string | number;
  quantity: number;
  onClear: () => Promise<void> | void;
  onChangeQty: (next: number) => Promise<void> | void;
}) {
  const lineTotal = Number(price) * (quantity || 0);

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
      {/* image */}
      <View className="overflow-hidden rounded-2xl">
        <Image
          source={
            cover ? { uri: cover } : require("@/assets/images/logo-transparent.png")
          }
          className="w-full h-40 bg-neutral-100"
        />
        <View className="absolute right-3 top-3 bg-white/90 rounded-full p-1.5">
          <Ionicons name="heart" size={16} color="#ffa800" />
        </View>
      </View>

      {/* title */}
      <Text className="mt-3 font-satoshiMedium text-[18px] text-neutral-900">
        {name}
      </Text>

      <View className="mt-3 flex-row items-center">
        <View className="flex-1">
          <Text className="text-[16px] text-neutral-700">
            {formatNGN(price)} <Text className="text-neutral-500">× {quantity}</Text>
          </Text>
          <Text className="text-[12px] text-neutral-400 mt-0.5">
            = {formatNGN(lineTotal)}
          </Text>
        </View>

        <View className="mr-2">
          <QuantityStepper value={quantity} onChange={onChangeQty} min={0} />
        </View>

        {/* clear */}
        <Pressable
          onPress={onClear}
          className="px-4 py-2 rounded-xl bg-neutral-900"
          style={{ alignSelf: "flex-start" }}
        >
          <Text className="text-white font-satoshiMedium">Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------- Screen ----------
export default function MyCartsTab() {
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectCartFetchStatus);
  const kitchenIds = useAppSelector(selectCartKitchenIds);
  const grandTotal = useAppSelector(selectCartSubtotal);
  const totalItems = useAppSelector(selectCartTotalItems);

  // Flatten items across kitchens
  const flatItems = useAppSelector((s) => {
    const out: {
      id: string;
      name: string;
      cover?: string | null;
      price: string | number;
      quantity: number;
    }[] = [];
    for (const kid of kitchenIds) {
      const items = selectCartItemsForKitchen(kid)(s);
      for (const it of items) {
        out.push({
          id: it.meal.id,
          name: it.meal.name,
          cover: it.meal.cover_image?.url ?? null,
          price: it.meal.price,
          quantity: it.quantity,
        });
      }
    }
    return out;
  });

  const handleRemove = async (mealId: string) => {
    try {
      const res = await dispatch(removeCartItem(mealId)).unwrap();
      showSuccess(res.message || "Removed from cart");
    } catch (e: any) {
      showError(e);
    }
  };

  const handleChangeQty = async (mealId: string, next: number) => {
    try {
      const res = await dispatch(setCartItem({ mealId, quantity: next })).unwrap();
      showSuccess(res.message || "Cart updated");
    } catch (e: any) {
      showError(e);
    }
  };

  const handleCheckout = () => {
    // placeholder – plug checkout screen later
    showSuccess("Checkout coming soon ✨");
  };

  if (status === "loading") {
    return (
      <ActivityIndicator style={{ marginTop: 160 }} color={"#ffa800"} size="small" />
    );
  }
  if (status === "failed") {
    return <Text className="text-center mt-10 text-red-600">Failed to load cart.</Text>;
  }
  if (!flatItems.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={require("@/assets/images/trayy.png")} />
        <Text className="text-neutral-500 mt-4">
          Your tray is empty, we are waiting for your orders
        </Text>
      </View>
    );
  }

  // width reserved for the FAB so the total pill never gets covered
  const reservedRight = 150; // ~ button width + gutter

  return (
    <View className="flex-1">
      <FlatList
        data={flatItems}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <CartItemCard
            id={item.id}
            name={item.name}
            cover={item.cover}
            price={item.price}
            quantity={item.quantity}
            onClear={() => handleRemove(item.id)}
            onChangeQty={(next) => handleChangeQty(item.id, next)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      {/* Total pill – anchored left, reserving space on the right for the FAB */}
      <View
        className="absolute bottom-6 left-4 bg-primary rounded-2xl px-4 py-3 border border-primary-500"
        style={{ right: reservedRight }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-satoshi">Total ({totalItems})</Text>
          <Text className="text-[18px] font-satoshiBold text-white">
            {formatNGN(grandTotal)}
          </Text>
        </View>
      </View>

      {/* Floating Checkout button (bottom-right) */}
      <Pressable
        onPress={handleCheckout}
        className="absolute bottom-5 right-4 bg-primary rounded-full px-5 py-4 items-center justify-center"
        style={{
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Pressable onPress={() => router.push("/users/checkout" as any)} className="flex-row items-center">
          <Ionicons name="bag-handle" size={18} color="#fff" />
          <Text className="ml-2 text-white font-satoshiBold">Checkout</Text>
        </Pressable>
      </Pressable>
    </View>
  );
}
