import { selectCartItemQuantity } from "@/redux/cart/cart.selectors";
import { setCartItem } from "@/redux/cart/cart.thunks";
import type { Meal } from "@/redux/meals/meals.types";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { capitalizeFirst } from "@/utils/capitalize";
import { formatNGN, toNum } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { showError, showSuccess } from "../ui/toast";

function AddToCartButton({
  itemId,
  qty,
  onAdd,
}: {
  itemId: string;
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
      onPress={added ? undefined : handlePress}
      disabled={pending || added}
      accessibilityRole="button"
      accessibilityLabel={added ? "Added to cart" : "Add to cart"}
      className={[
        "rounded-full px-3 py-1 flex-row items-center",
        added ? "bg-secondary" : "bg-primary",
        pending || added ? "opacity-90" : "",
      ].join(" ")}
      style={{ justifyContent: "center" }}
    >
      {added ? (
        <>
          <Text className="ml-1 text-black font-satoshiMedium text-[12px]">
            Added to Cart
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
}: {
  item: Meal;
  compact?: boolean;
  onPress?: () => void;
}) {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const kitchenId = item?.kitchen_id ?? "";
  const qty = useAppSelector(selectCartItemQuantity(kitchenId, item.id));

  const addOne = async () => {
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
        {item.cover_image?.url ? (
          <Image
            source={{ uri: item.cover_image.url }}
            className="w-full h-full"
          />
        ) : (
          <View className={`flex-1 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`} />
        )}
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
          <AddToCartButton itemId={item.id} qty={qty} onAdd={addOne} />
        </View>
      </View>
    </Pressable>
  );
}
