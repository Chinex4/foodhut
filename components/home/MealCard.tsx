import { selectCartItemQuantity } from "@/redux/cart/cart.selectors";
import { setCartItem } from "@/redux/cart/cart.thunks";
import type { Meal } from "@/redux/meals/meals.types";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import { capitalizeFirst } from "@/utils/capitalize";
import { formatNGN, toNum } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { showError, showSuccess } from "../ui/toast";

function AddToCartButton({
  qty,
  onAdd,
}: {
  qty: number;
  onAdd: () => Promise<void> | void;
}) {
  const [pending, setPending] = React.useState(false);
  const added = qty > 0;

  const handlePress = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onAdd();
    } finally {
      setPending(false);
    }
  };

  return (
    <Pressable
      onPress={added ? () => router.push("/users/(tabs)/orders") : handlePress}
      disabled={pending}
      accessibilityRole="button"
      accessibilityLabel={added ? "View cart" : "Add to cart"}
      className={[
        "rounded-full px-3 py-1 flex-row items-center",
        added ? "bg-secondary" : "bg-primary",
        pending ? "opacity-90" : "",
      ].join(" ")}
      style={{ justifyContent: "center" }}
    >
      {added ? (
        <>
          <Text className="ml-1 text-black font-satoshiMedium text-[12px]">
            View Cart
          </Text>
        </>
      ) : (
        <Text className="text-white font-satoshiMedium text-[12px]">
          {pending ? "Adding..." : "Add To Cart"}
        </Text>
      )}
    </Pressable>
  );
}

export default function MealCard({
  item,
  onPress,
  compact = false,
  kitchenName,
  kitchenRating,
}: {
  item: Meal;
  compact?: boolean;
  onPress?: () => void;
  kitchenName?: string;
  kitchenRating?: string | number | null;
}) {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const kitchenId = item?.kitchen_id ?? "";
  const qty = useAppSelector(selectCartItemQuantity(kitchenId, item.id));
  const warnedRef = React.useRef(false);

  const warnGuest = () => {
    if (!isAuthenticated && !warnedRef.current) {
      warnedRef.current = true;
      showError("You're adding items as a guest. Create an account to save your orders.");
    }
  };

  const addOne = async () => {
    warnGuest();
    try {
      const res = await dispatch(
        setCartItem({ mealId: item.id, quantity: qty + 1 })
      ).unwrap();
      showSuccess(res.message || "Added to cart");
    } catch (err: any) {
      showError(err);
    }
  };
  return (
    <Pressable
      onPress={onPress}
      className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"} rounded-2xl border overflow-hidden ${compact ? "w-[200px]" : "w-full"}`}
      style={{
        shadowOpacity: isDark ? 0 : 0.05,
        shadowRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* cover */}
      <View className={`${compact ? "h-36" : "h-44"} w-full`}>
        <Image
          source={
            item.cover_image?.url
              ? { uri: item.cover_image.url }
              : require("@/assets/images/food1.png")
          }
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className={`absolute right-3 top-3 ${isDark ? "bg-neutral-900/90" : "bg-white/90"} rounded-full px-2 py-1 flex-row items-center`}>
          <Ionicons name="star" size={14} color="#FFA800" />
          <Text className={`ml-1 font-satoshiMedium text-[12px] ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
            {String(item.rating ?? "0")}
          </Text>
        </View>
      </View>

      {/* info */}
      <View className="p-3">
        <Text
          className={`font-satoshiMedium text-[16px] ${isDark ? "text-white" : "text-neutral-900"}`}
          numberOfLines={1}
        >
          {capitalizeFirst(item.name)}
        </Text>
        {kitchenName ? (
          <View className="flex-row items-center mt-1">
            <Text
              className={`text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
              numberOfLines={1}
            >
              {kitchenName}
            </Text>
            {kitchenRating ? (
              <>
                <Text className={`mx-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                  •
                </Text>
                <Ionicons name="star" size={12} color="#FFA800" />
                <Text
                  className={`ml-1 text-[12px] ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
                >
                  {String(kitchenRating)}
                </Text>
              </>
            ) : null}
          </View>
        ) : null}
        <Text className={`text-[12px] mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`} numberOfLines={1}>
          {capitalizeFirst(item.description)}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-end">
            <Text className={`font-satoshiBold text-[18px] ${isDark ? "text-white" : "text-neutral-900"}`}>
              {formatNGN(item.price)}
            </Text>
            {toNum(item.original_price) > toNum(item.price) && (
              <Text className={`ml-2 line-through ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                {formatNGN(item.original_price!)}
              </Text>
            )}
          </View>

          {/* Add / Added button */}
          <AddToCartButton qty={qty} onAdd={addOne} />
        </View>
      </View>
    </Pressable>
  );
}
