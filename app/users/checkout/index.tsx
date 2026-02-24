import CachedImageView from "@/components/ui/CachedImage";
import { showError, showSuccess } from "@/components/ui/toast";
import { capitalizeFirst } from "@/utils/capitalize";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  selectCartCheckoutStatus,
  selectCartKitchenIds,
  selectCartSubtotalForKitchens,
  selectCartTotalItemsForKitchens,
  selectOrderRowsForKitchens,
} from "@/redux/cart/cart.selectors";
import { checkoutActiveCart, removeCartItem, setCartItem } from "@/redux/cart/cart.thunks";
import { makeSelectPayStatus } from "@/redux/orders/orders.selectors";
import { payForOrder } from "@/redux/orders/orders.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectWalletBalanceNumber,
  selectWalletProfileStatus,
} from "@/redux/wallet/wallet.selectors";
import { fetchWalletProfile } from "@/redux/wallet/wallet.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";
import { listenRiderPicked } from "@/utils/riderBus.native";
import { mockMeals } from "@/utils/mockData";

type PaymentUI = "ONLINE" | "WALLET" | "PAY_FOR_ME";

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text className={`font-satoshiBold text-[16px] mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
      {title}
    </Text>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  isDark,
}: {
  label: string;
  value: string;
  bold?: boolean;
  isDark: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text
        className={`font-satoshi ${bold ? "font-satoshiBold" : ""} ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
      >
        {label}
      </Text>
      <Text className={`${bold ? "font-satoshiBold" : ""} ${isDark ? "text-white" : "text-neutral-900"}`}>
        {value}
      </Text>
    </View>
  );
}

function Radio({
  label,
  selected,
  onPress,
  rightEl,
  isDark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  rightEl?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center">
        <View
          className={`w-5 h-5 rounded-full border mr-3 ${
            selected ? "border-primary bg-primary" : isDark ? "border-neutral-600" : "border-neutral-400"
          }`}
        />
        <Text className={` ${isDark ? 'text-neutral-400' : 'text-neutral-800'} font-satoshiMedium`}>{label}</Text>
      </View>
      {rightEl}
    </Pressable>
  );
}

type Rider = {
  id: string;
  name: string;
  city: string;
  priceLabel: string;
  rating: number;
  avatar?: string;
};

const parseKitchenIdsParam = (
  kitchenIdsParam?: string | string[],
  kitchenIdParam?: string
) => {
  const source =
    typeof kitchenIdsParam === "string"
      ? kitchenIdsParam
      : Array.isArray(kitchenIdsParam)
        ? kitchenIdsParam.join(",")
        : kitchenIdParam ?? "";

  const ids = source
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return Array.from(new Set(ids));
};

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { kitchen_id, kitchen_ids, tab: startTab } = useLocalSearchParams<{
    kitchen_id?: string;
    kitchen_ids?: string | string[];
    tab?: string;
  }>();
  const kitchenIds = useAppSelector(selectCartKitchenIds);

  const requestedKitchenIds = useMemo(
    () => parseKitchenIdsParam(kitchen_ids, kitchen_id),
    [kitchen_ids, kitchen_id]
  );

  const activeKitchenIds = useMemo(() => {
    const filteredRequested = requestedKitchenIds.filter((id) =>
      kitchenIds.includes(id)
    );
    if (filteredRequested.length) return filteredRequested;
    return kitchenIds[0] ? [kitchenIds[0]] : [];
  }, [kitchenIds, requestedKitchenIds]);

  const orderRowsSelector = useMemo(
    () => selectOrderRowsForKitchens(activeKitchenIds),
    [activeKitchenIds]
  );
  const orderRows = useAppSelector(orderRowsSelector);
  const subtotal = useAppSelector(selectCartSubtotalForKitchens(activeKitchenIds));
  const totalItems = useAppSelector(selectCartTotalItemsForKitchens(activeKitchenIds));
  const checkoutStatus = useAppSelector(selectCartCheckoutStatus);

  // UI state
  const isGroupCheckout = activeKitchenIds.length > 1;
  const [tab, setTab] = useState<"ORDER" | "DELIVERY">(
    String(startTab ?? "").toUpperCase() === "DELIVERY" ? "DELIVERY" : "ORDER"
  );
  const [address, setAddress] = useState<string>("");
  const [fulfillment, setFulfillment] = useState<
    "DELIVERY" | "PICKUP" | "SITIN"
  >("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentUI>("ONLINE");

  const [riderNote, setRiderNote] = useState<string>("");
  const [voucher, setVoucher] = useState<string>("");
  const voucherEndsOn = "02/10/2025";

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // simple static fees (replace if backend returns these)
  // const deliveryFee = useMemo(() => (subtotal > 0 ? 1200 : 0), [subtotal]);
  // const serviceFee = useMemo(() => Math.round(subtotal * 0.02), [subtotal]);
  // const total = useMemo(
  //   () => subtotal + deliveryFee + serviceFee,
  //   [subtotal, deliveryFee, serviceFee]
  // );

  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const paySelector = useMemo(
    () => (orderId ? makeSelectPayStatus(orderId) : null),
    [orderId]
  );
  const payStatus = useAppSelector(paySelector ?? (() => "idle")) ?? "idle";

  // ============ Wallet Integration ============
  const walletBalance = useAppSelector(selectWalletBalanceNumber);
  const walletProfileStatus = useAppSelector(selectWalletProfileStatus);

  useEffect(() => {
    if (walletProfileStatus === "idle" && isAuthenticated) {
      dispatch(fetchWalletProfile());
    }
  }, [walletProfileStatus, dispatch, isAuthenticated]);

  // ============ Fees (REMOVED) ============
  // Removed delivery_fee and service_fee as per requirements
  const total = useMemo(() => subtotal, [subtotal]);

  const isBusy =
    placing || checkoutStatus === "loading" || payStatus === "loading";

  useEffect(() => {
    const off = listenRiderPicked((r) => setSelectedRider(r));
    return off;
  }, []);

  useEffect(() => {
    if (activeKitchenIds.length > 0 && orderRows.length === 0) {
      router.replace("/users/(tabs)/orders?tab=carts");
    }
  }, [activeKitchenIds.length, orderRows.length, router]);

  const canPlace =
    subtotal >= 0 &&
    totalItems > 0 &&
    (fulfillment !== "DELIVERY" || !!address.trim()) &&
    activeKitchenIds.length > 0 &&
    !isBusy;

  const handlePlaceOrder = async () => {
    try {
      if (!activeKitchenIds.length) {
        return showError("Select at least one kitchen to continue.");
      }
      if (!isAuthenticated) {
        showError("You're checking out as a guest. Create an account to track your order history.");
      }
      if (paymentMethod === "WALLET" && walletBalance < subtotal) {
        return showError("Insufficient wallet balance. Please top up.");
      }

      setPlacing(true);
      const createdOrderIds: string[] = [];

      for (const selectedKitchenId of activeKitchenIds) {
        const payload = {
          kitchen_id: selectedKitchenId,
          payment_method:
            paymentMethod === "PAY_FOR_ME" || paymentMethod === "WALLET"
              ? "WALLET"
              : "ONLINE",
          delivery_address: address.trim(),
          dispatch_rider_note: (riderNote ?? "").trim(),
          delivery_date: undefined,
          rider_id: selectedRider?.id || undefined,
        } as const;

        const checkoutRes = await dispatch(checkoutActiveCart(payload)).unwrap();
        createdOrderIds.push(checkoutRes.result.id as string);
      }

      if (!createdOrderIds.length) {
        throw new Error("No order was created");
      }

      setOrderId(createdOrderIds[0]);
      showSuccess(
        createdOrderIds.length > 1
          ? `${createdOrderIds.length} orders created successfully!`
          : "Order created successfully!"
      );

      // Navigate to ongoing tab to see the pending order
      setTimeout(() => {
        router.replace(`/users/(tabs)/orders?tab=ongoing`);
      }, 500);

      // Handle Pay for Me (async, don't block on this)
      if (paymentMethod === "PAY_FOR_ME") {
        try {
          const payLinks: string[] = [];
          for (const createdId of createdOrderIds) {
            const payRes = await dispatch(
              payForOrder({ id: createdId, with: "ONLINE" })
            ).unwrap();
            if (payRes.with === "ONLINE" && typeof payRes.url === "string") {
              payLinks.push(payRes.url);
            }
          }

          if (payLinks.length > 0) {
            const shareText = `Help me complete my food order payment:\n${payLinks.join("\n")}`;
            Alert.alert(
              "Share link",
              "Copy the link or share it with a friend.",
              [
                {
                  text: "Copy Link",
                  onPress: async () => {
                    await Clipboard.setStringAsync(payLinks.join("\n"));
                    showSuccess("Link copied to clipboard.");
                  },
                },
                {
                  text: "Share",
                  onPress: async () => {
                    await Share.share({ message: shareText });
                  },
                },
                { text: "Cancel", style: "cancel" },
              ]
            );
          } else {
            showError("Payment link not available yet. Please try again.");
          }
        } catch (err: any) {
          showError(err?.message || "Failed to generate pay-for-me link. You can complete payment later.");
        }
        return;
      }

      // Handle Online Payment (async, don't block on this)
      if (paymentMethod === "ONLINE") {
        try {
          if (createdOrderIds.length > 1) {
            showSuccess("Orders created. Complete payment for each order from your Ongoing tab.");
            return;
          }
          const payRes = await dispatch(
            payForOrder({ id: createdOrderIds[0], with: "ONLINE" })
          ).unwrap();
          if (payRes.with === "ONLINE" && payRes.url) {
            const url = payRes.url;
            await WebBrowser.openBrowserAsync(url);
            showSuccess("Complete payment in the browser");
          }
        } catch (err: any) {
          showError(err?.message || "Failed to open payment. You can retry from Ongoing orders.");
        }
        return;
      }

      // Handle Wallet Payment
      if (paymentMethod === "WALLET") {
        try {
          for (const createdId of createdOrderIds) {
            await dispatch(payForOrder({ id: createdId, with: "WALLET" })).unwrap();
          }
          showSuccess(
            createdOrderIds.length > 1
              ? "Group wallet payment successful!"
              : "Payment successful!"
          );
        } catch (err: any) {
          showError(err?.message || "Wallet payment failed. You can retry from Ongoing orders.");
        }
        return;
      }
    } catch (err: any) {
      console.log("Checkout error:", err?.response?.data || err);
      showError(
        err?.message || err || "Failed to place order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-[#FFFDF8]"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <View className={`pt-20 pb-3 px-5 ${isDark ? "bg-neutral-950" : "bg-[#FFFDF8]"}`}>
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.push("/users/(tabs)/orders")} className="mr-2">
            <Ionicons name="chevron-back" size={22} color={isDark ? "#fff" : "#0F172A"} />
          </Pressable>
          <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Checkout
          </Text>
          <View className="w-10" />
        </View>

        {!isAuthenticated && (
          <View className={`mt-4 rounded-2xl border px-3 py-2 ${isDark ? "border-neutral-800 bg-neutral-900" : "border-primary-100 bg-primary-50"}`}>
            <Text className={`${isDark ? "text-neutral-200" : "text-neutral-700"} text-xs font-satoshi`}>
              Guest checkout: create an account to save your details and track orders.
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row mt-5">
          <Pressable onPress={() => setTab("ORDER")} className="mr-6 pb-2">
            <Text
              className={`${
                tab === "ORDER"
                  ? `font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`
                  : `font-satoshi ${isDark ? "text-neutral-500" : "text-neutral-500"}`
              }`}
            >
              Your Order
            </Text>
            {tab === "ORDER" && (
              <View className="h-1 bg-primary rounded-full mt-2" />
            )}
          </Pressable>

          <Pressable onPress={() => setTab("DELIVERY")} className="pb-2">
            <Text
              className={`${
                tab === "DELIVERY"
                  ? `font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`
                  : `font-satoshi ${isDark ? "text-neutral-500" : "text-neutral-500"}`
              }`}
            >
              Delivery & Payment
            </Text>
            {tab === "DELIVERY" && (
              <View className="h-1 bg-primary rounded-full mt-2" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {tab === "ORDER" ? (
        <View className="flex-1 px-5">
          <FlatList
            data={orderRows}
            keyExtractor={(x) => x.id}
            contentContainerStyle={{ paddingBottom: 180 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View>
                <SectionHeader title="Order Summary" isDark={isDark} />
                {isGroupCheckout && (
                  <View
                    className={`mb-3 rounded-xl px-3 py-2 border ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-satoshiMedium ${
                        isDark ? "text-neutral-300" : "text-neutral-700"
                      }`}
                    >
                      Group checkout across {activeKitchenIds.length} kitchens
                    </Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => {
              const mealId = item.mealId;
              const quantity = item.qty;
              const adjust = (delta: number) => {
                const nextQty = quantity + delta;
                if (nextQty <= 0) {
                  dispatch(removeCartItem(mealId));
                } else {
                  dispatch(setCartItem({ mealId, quantity: nextQty }));
                }
              };
              return (
              <View
                className={`rounded-2xl border mb-4 p-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                style={{
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <View className="flex-row">
                  <CachedImageView
                    uri={item.cover || undefined}
                    fallback={
                      <Image
                        source={require("@/assets/images/food1.png")}
                        className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                      />
                    }
                    className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                  />
                  <View className="flex-1 ml-3 justify-center">
                    <Text
                      numberOfLines={1}
                      className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
                    >
                      {capitalizeFirst(item.title)}
                    </Text>
                    {isGroupCheckout && (
                      <Text
                        numberOfLines={1}
                        className={`text-[11px] mt-0.5 ${
                          isDark ? "text-neutral-500" : "text-neutral-500"
                        }`}
                      >
                        {item.kitchenName}
                      </Text>
                    )}
                    <Text className={`font-satoshi mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {formatNGN(item.price)}{" "}
                      <Text className={isDark ? "text-neutral-600" : "text-neutral-400"}>× {item.qty}</Text>
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {formatNGN(item.price * item.qty)}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Pressable
                        onPress={() => adjust(-1)}
                        className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                      >
                        <Ionicons name="remove" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
                      </Pressable>
                      <Text className={`mx-2 font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                        {quantity}
                      </Text>
                      <Pressable
                        onPress={() => adjust(1)}
                        className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                      >
                        <Ionicons name="add" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
                      </Pressable>
                      <Pressable onPress={() => dispatch(removeCartItem(mealId))} className="ml-3">
                        <Ionicons name="trash-outline" size={18} color={isDark ? "#ef4444" : "#dc2626"} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
            ListFooterComponent={
              <View className="mt-2 mb-6">
                <Text
                  className={`font-satoshiBold text-[16px] mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}
                >
                  You might also like
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {mockMeals.slice(0, 6).map((meal) => (
                      <Pressable
                        key={meal.id}
                        onPress={() => router.push(`/users/meal/${meal.id}`)}
                        className={`w-40 rounded-2xl border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                      >
                        <Image
                          source={
                            meal.cover_image?.url
                              ? { uri: meal.cover_image.url }
                              : require("@/assets/images/food1.png")
                          }
                          className="w-full h-24 rounded-t-2xl"
                          resizeMode="cover"
                        />
                        <View className="p-3">
                          <Text
                            numberOfLines={1}
                            className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
                          >
                            {capitalizeFirst(meal.name)}
                          </Text>
                          <Text
                            className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                          >
                            {formatNGN(Number(meal.price))}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            }
            ListEmptyComponent={
              <View className="items-center mt-12">
                <Image source={require("@/assets/images/trayy.png")} />
                <Text className={isDark ? "text-neutral-400 mt-3" : "text-neutral-500 mt-3"}>
                  Your tray is empty, add meals to continue.
                </Text>
              </View>
            }
          />

          {/* Bottom bar */}
          <View className={`absolute left-0 right-0 bottom-0 px-5 pb-6 pt-4 ${isDark ? "bg-neutral-950" : "bg-[#FFFDF8]"}`}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`font-satoshi ${isDark ? "text-neutral-400" : "text-neutral-700"}`}>
                Items ({totalItems})
              </Text>
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(subtotal)}
              </Text>
            </View>
            <Pressable
              onPress={() => setTab("DELIVERY")}
              className="bg-primary rounded-2xl py-4 items-center justify-center"
            >
              <Text className="text-white font-satoshiBold">
                {isGroupCheckout ? "Make Group Payment" : "Make Payment"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-1 px-5">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 200 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form fields */}
            <View className="space-y-3">
              {/* Fulfillment */}
              <View
                className={`rounded-2xl border p-3 ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                <Text
                  className={`font-satoshiMedium mb-2 ${isDark ? "text-neutral-200" : "text-neutral-700"}`}
                >
                  Fulfillment
                </Text>
                <View className="flex-row">
                  {[
                    { k: "DELIVERY", label: "Delivery" },
                    { k: "PICKUP", label: "Pickup" },
                    { k: "SITIN", label: "Sitin" },
                  ].map((opt) => (
                    <Pressable
                      key={opt.k}
                      onPress={() => setFulfillment(opt.k as any)}
                      className={`flex-1 mr-2 rounded-xl py-3 items-center ${
                        fulfillment === opt.k
                          ? "bg-primary"
                          : isDark
                            ? "bg-neutral-800"
                            : "bg-neutral-100"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-satoshiMedium ${
                          fulfillment === opt.k
                            ? "text-white"
                            : isDark
                              ? "text-neutral-300"
                              : "text-neutral-700"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Address */}
              <View
                className={`rounded-2xl border px-3 py-4 flex-row items-center ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                <Ionicons name="location-outline" size={18} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder={
                    fulfillment === "DELIVERY"
                      ? "Enter Delivery Address"
                      : "Optional pickup notes"
                  }
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`ml-3 flex-1 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
                />
              </View>

              {/* Message for the rider (dispatch_rider_note REQUIRED by API) */}
              <View
                className={`rounded-2xl border px-3 py-4 flex-row items-center ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                <Ionicons name="bicycle-outline" size={18} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                <TextInput
                  value={riderNote}
                  onChangeText={setRiderNote}
                  placeholder="Message for the rider"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`ml-3 flex-1 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
                />
              </View>

              {/* Voucher code */}
              <View
                className={`rounded-2xl border px-3 py-4 ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="pricetags-outline"
                    size={18}
                    color={isDark ? "#9CA3AF" : "#9CA3AF"}
                  />
                  <TextInput
                    value={voucher}
                    onChangeText={setVoucher}
                    placeholder="Voucher / Discount code"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className={`ml-3 flex-1 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
                  />
                  <Pressable className="ml-3 px-3 py-2 rounded-lg bg-primary">
                    <Text className="text-white text-[12px] font-satoshiBold">
                      Apply
                    </Text>
                  </Pressable>
                </View>
                <Text className={`text-[12px] mt-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                  Ends on {voucherEndsOn}
                </Text>
              </View>
            </View>

            {/* Riders */}
            {fulfillment === "DELIVERY" ? (
              <View className="mt-5">
                <SectionHeader title="Delivery Rider" isDark={isDark} />
                {selectedRider ? (
                  <View
                    className={`rounded-2xl border p-3 flex-row items-center justify-between ${
                      isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                    }`}
                  >
                    <View className="flex-row items-center">
                    <CachedImageView
                      uri={selectedRider.avatar}
                      fallback={
                        <Image
                          source={require("@/assets/images/logo-transparent.png")}
                          className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                        />
                      }
                      className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                    />
                      <View className="ml-3">
                        <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                          {selectedRider.name}
                        </Text>
                        <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                          {selectedRider.city} • {selectedRider.priceLabel}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => router.push("/users/riders")}
                      className="px-3 py-2 rounded-xl bg-primary"
                    >
                      <Text className="text-white font-satoshiMedium">
                        Change
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View
                    className={`rounded-2xl border p-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                  >
                    <Text
                      className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}
                    >
                      Find a rider
                    </Text>
                    <Text
                      className={`text-[12px] mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                    >
                      We will match the closest rider and show their fee before you pay.
                    </Text>
                    <Pressable
                      onPress={() => router.push("/users/riders")}
                      className="mt-3 bg-primary rounded-2xl py-3 items-center justify-center"
                    >
                      <Text className="text-white font-satoshiBold">
                        Find Riders
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : null}

            {/* Payment Summary */}
            <View className="mt-5">
              <SectionHeader title="Payment Summary" isDark={isDark} />
              <View
                className={`rounded-2xl border p-3 ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                }`}
              >
                <SummaryRow
                  label={`Sub-total (${totalItems} item${totalItems === 1 ? "" : "s"})`}
                  value={formatNGN(subtotal)}
                  isDark={isDark}
                />
                <View className={`h-[1px] my-2 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`} />
                <SummaryRow label="Total Payment" value={formatNGN(total)} bold isDark={isDark} />
              </View>
            </View>

            {/* Payment Method */}
            <View className="mt-5">
              <SectionHeader title="Payment Method" isDark={isDark} />
              <View
                className={`rounded-2xl border px-3 ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                }`}
              >
                {/* Pay Online */}
                <Radio
                  label="Pay Online (Paystack)"
                  selected={paymentMethod === "ONLINE"}
                  onPress={() => setPaymentMethod("ONLINE")}
                  isDark={isDark}
                />
                <View className="h-[1px] bg-neutral-100" />

                {/* Pay with Wallet */}
                <Radio
                  label={`Pay with Wallet (${formatNGN(walletBalance)})`}
                  selected={paymentMethod === "WALLET"}
                  onPress={() => setPaymentMethod("WALLET")}
                  rightEl={
                    walletBalance < subtotal ? (
                      <Text className="text-red-600 text-xs font-satoshiMedium">
                        Insufficient
                      </Text>
                    ) : undefined
                  }
                  isDark={isDark}
                />
                <View className="h-[1px] bg-neutral-100" />

                {/* Pay For Me */}
                <Radio
                  label="Pay For Me (Share Link)"
                  selected={paymentMethod === "PAY_FOR_ME"}
                  onPress={() => setPaymentMethod("PAY_FOR_ME")}
                  rightEl={
                    <Text className="text-[11px] text-neutral-500">
                      Share with friend
                    </Text>
                  }
                  isDark={isDark}
                />
              </View>
            </View>

            {/* kitchen selection removed as checkout is per kitchen */}
          </ScrollView>

          {/* Bottom buttons */}
          <View
            className={`absolute left-0 right-0 bottom-0 px-5 pb-6 pt-4 ${
              isDark ? "bg-neutral-950 border-t border-neutral-800" : "bg-[#FFFDF8]"
            }`}
          >
            <View className="flex-row">
              <Pressable
                onPress={() => setTab("ORDER")}
                className={`flex-1 mr-3 rounded-2xl py-4 items-center justify-center border ${
                  isDark ? "bg-neutral-900 border-neutral-700" : "bg-[#FFF1E0] border-primary-500"
                }`}
              >
                <Text
                  className={`font-satoshiMedium ${
                    isDark ? "text-neutral-100" : "text-primary"
                  }`}
                >
                  Return
                </Text>
              </Pressable>

              <Pressable
                disabled={!canPlace}
                onPress={handlePlaceOrder}
                className={`flex-1 rounded-2xl py-4 items-center justify-center ${
                  canPlace ? "bg-primary" : isDark ? "bg-neutral-800" : "bg-neutral-300"
                }`}
              >
                {isBusy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-satoshiBold">
                    Place Order
                  </Text>
                )}
              </Pressable>
            </View>

            <Text className="mt-3 text-[12px] text-neutral-500 text-center">
              By proceeding, you agree to our{" "}
              <Text className="text-primary">Terms Of Use</Text> and{" "}
              <Text className="text-primary">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
