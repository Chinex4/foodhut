import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById, payForOrder } from "@/redux/orders/orders.thunks";
import {
  makeSelectPayStatus,
  selectOrderById,
  makeSelectOrderByIdStatus,
} from "@/redux/orders/orders.selectors";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { formatNGN } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import CachedImageView from "@/components/ui/CachedImage";
import { setCartItem } from "@/redux/cart/cart.thunks";
import { useEnsureAuthenticated } from "@/hooks/useEnsureAuthenticated";
import { showError, showSuccess } from "@/components/ui/toast";
import { goBackOrReplace } from "@/utils/navigation";
import { selectOffersForOrder } from "@/redux/logistics/logistics.selectors";
import {
  acceptDeliveryOffer,
  counterDeliveryOffer,
  fetchDeliveryOffers,
  rejectDeliveryOffer,
} from "@/redux/logistics/logistics.thunks";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrderById(id!));
  const status = useAppSelector(makeSelectOrderByIdStatus(id!));
  const payStatus = useAppSelector(makeSelectPayStatus(id!));
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const { isAuthenticated, redirectToLogin } = useEnsureAuthenticated();
  const canRepeat = order?.status === "DELIVERED";
  const canPay = order?.status === "AWAITING_PAYMENT";
  const [counterAmount, setCounterAmount] = useState<Record<string, string>>({});
  const offersSelector = useMemo(() => selectOffersForOrder(id!), [id]);
  const offers = useAppSelector(offersSelector);

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin]);

  useEffect(() => {
    if (!order) dispatch(fetchOrderById(id!));
    dispatch(fetchDeliveryOffers(id!));
  }, [id, order, dispatch]);

  const offerAction = async (
    action: "accept" | "reject" | "counter",
    offerId: string
  ) => {
    try {
      if (action === "accept") await dispatch(acceptDeliveryOffer(offerId)).unwrap();
      if (action === "reject") await dispatch(rejectDeliveryOffer(offerId)).unwrap();
      if (action === "counter") {
        const amount = Number(counterAmount[offerId]);
        if (!amount) return;
        await dispatch(counterDeliveryOffer({ offer_id: offerId, amount })).unwrap();
      }
      showSuccess("Delivery offer updated");
    } catch (err: any) {
      showError(err);
    }
  };

  if (!order || status === "loading")
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text className={`text-center mt-10 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          Loading…
        </Text>
      </View>
    );

  return (
    <View className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2 mt-20">
        <Pressable onPress={() => goBackOrReplace(router, "/users/(tabs)/orders")} className="mr-2 p-1">
          <Ionicons name="chevron-back" size={26} color={isDark ? "#E5E7EB" : "#111"} />
        </Pressable>
        <Text className={`text-2xl font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          Order #{order.id.slice(-6)}
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(it) => it.id ?? it.meal_id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            className={`rounded-2xl border p-3 mb-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
          >
            <View className="flex-row">
              <CachedImageView
                uri={item.meal.cover_image?.url ?? undefined}
                fallback={
                  <View
                    className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                  />
                }
                className={`w-16 h-16 rounded-xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
              />
              <View className="ml-3 flex-1">
                <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {item.meal.name}
                </Text>
                <Text className={`text-[12px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {formatNGN(item.price)} × {item.quantity}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Subtotal</Text>
              <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(order.sub_total)}
              </Text>
            </View>
            {order.delivery_fee && (
              <View className="flex-row justify-between mb-2">
                <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Delivery</Text>
                <Text className={`font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {formatNGN(order.delivery_fee)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mt-2">
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                Total
              </Text>
              <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {formatNGN(order.total)}
              </Text>
            </View>
            {offers.length > 0 ? (
              <View className="mt-6">
                <Text className={`font-satoshiBold mb-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
                  Delivery offers
                </Text>
                {offers.map((offer) => (
                  <View
                    key={offer.id}
                    className={`rounded-2xl p-3 mb-3 border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                  >
                    <View className="flex-row justify-between">
                      <Text className={isDark ? "text-neutral-300" : "text-neutral-600"}>
                        Rider #{offer.rider_id.slice(0, 8)}
                      </Text>
                      <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                        {formatNGN(offer.amount)}
                      </Text>
                    </View>
                    <Text className="text-primary font-satoshiBold mt-1">{offer.status}</Text>
                    {offer.status !== "ACCEPTED" && offer.status !== "REJECTED" ? (
                      <>
                        <View className="flex-row mt-3">
                          <Pressable
                            onPress={() => offerAction("accept", offer.id)}
                            className="flex-1 bg-primary rounded-xl py-3 items-center mr-2"
                          >
                            <Text className="text-white font-satoshiBold">Accept</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => offerAction("reject", offer.id)}
                            className={`flex-1 rounded-xl py-3 items-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
                          >
                            <Text className={isDark ? "text-neutral-200" : "text-neutral-700"}>Reject</Text>
                          </Pressable>
                        </View>
                        <View className="flex-row mt-3">
                          <TextInput
                            value={counterAmount[offer.id] || ""}
                            onChangeText={(value) =>
                              setCounterAmount((prev) => ({
                                ...prev,
                                [offer.id]: value.replace(/[^0-9]/g, ""),
                              }))
                            }
                            keyboardType="number-pad"
                            placeholder="Counter amount"
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            className={`flex-1 rounded-xl px-3 py-3 mr-2 ${isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-900"}`}
                          />
                          <Pressable
                            onPress={() => offerAction("counter", offer.id)}
                            className="px-4 rounded-xl bg-primary items-center justify-center"
                          >
                            <Text className="text-white font-satoshiBold">Send</Text>
                          </Pressable>
                        </View>
                      </>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
            {canPay && (
              <Pressable
                onPress={async () => {
                  try {
                    const payRes = await dispatch(
                      payForOrder({ id: order.id, with: "ONLINE" })
                    ).unwrap();
                    if (payRes.with === "ONLINE" && payRes.url) {
                      await WebBrowser.openBrowserAsync(payRes.url);
                      showSuccess("Complete payment in your browser");
                    }
                  } catch (err: any) {
                    showError(err?.message || "Failed to start payment");
                  }
                }}
                disabled={payStatus === "loading"}
                className={`mt-5 rounded-2xl py-4 items-center justify-center ${
                  payStatus === "loading" ? "bg-neutral-500" : "bg-primary"
                }`}
              >
                {payStatus === "loading" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-satoshiBold">
                    Complete Payment
                  </Text>
                )}
              </Pressable>
            )}
            {canRepeat && (
              <Pressable
                onPress={async () => {
                  for (const item of order.items) {
                    await dispatch(
                      setCartItem({
                        mealId: item.meal_id,
                        quantity: item.quantity,
                        meal: item.meal,
                        kitchen: order.kitchen,
                      })
                    );
                  }
                  router.push("/users/(tabs)/orders");
                }}
                className="mt-5 bg-primary rounded-2xl py-4 items-center justify-center"
              >
                <Text className="text-white font-satoshiBold">
                  Repeat Order
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}
