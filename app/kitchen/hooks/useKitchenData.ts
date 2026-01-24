import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import {
  selectKitchenProfile,
  selectKitchenProfileStatus,
} from "@/redux/kitchen/kitchen.selectors";
import {
  fetchKitchenProfile,
} from "@/redux/kitchen/kitchen.thunks";
import {
  selectMealsArray,
  selectMealsListStatus,
  selectMealsQuery,
} from "@/redux/meals/meals.selectors";
import { fetchMeals } from "@/redux/meals/meals.thunks";
import {
  selectOrdersList,
  selectOrdersListStatus,
  selectOrdersQuery,
  selectOrdersState,
} from "@/redux/orders/orders.selectors";
import { fetchOrders } from "@/redux/orders/orders.thunks";

export function useKitchenData() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const kitchen = useAppSelector(selectKitchenProfile);
  const kitchenStatus = useAppSelector(selectKitchenProfileStatus);

  const meals = useAppSelector(selectMealsArray);
  const mealsStatus = useAppSelector(selectMealsListStatus);
  const mealsQuery = useAppSelector(selectMealsQuery);

  const orders = useAppSelector(selectOrdersList);
  const ordersStatus = useAppSelector(selectOrdersListStatus);
  const ordersQuery = useAppSelector(selectOrdersQuery);
  const ordersState = useAppSelector(selectOrdersState);

  useEffect(() => {
    if (!kitchen) {
      dispatch(fetchKitchenProfile());
    }
  }, [dispatch, kitchen]);

  useEffect(() => {
    if (!kitchen?.id || mealsStatus === "loading") return;
    const needsMeals =
      !mealsQuery ||
      mealsQuery.kitchen_id !== kitchen.id ||
      mealsQuery.page !== 1 ||
      mealsQuery.per_page !== 200;
    if (needsMeals) {
      dispatch(fetchMeals({ page: 1, per_page: 200, kitchen_id: kitchen.id }));
    }
  }, [dispatch, kitchen?.id, mealsQuery, mealsStatus]);

  useEffect(() => {
    if (!kitchen?.id || ordersStatus === "loading") return;
    const needsOrders =
      !ordersQuery ||
      ordersQuery.kitchen_id !== kitchen.id ||
      ordersQuery.status !== "AWAITING_ACKNOWLEDGEMENT" ||
      ordersQuery.per_page !== 50 ||
      ordersQuery.page !== 1 ||
      ordersQuery.as_kitchen !== true;
    if (needsOrders) {
      dispatch(
        fetchOrders({
          kitchen_id: kitchen.id,
          per_page: 50,
          page: 1,
          status: "AWAITING_ACKNOWLEDGEMENT",
          as_kitchen: true,
        })
      );
    }
  }, [dispatch, kitchen?.id, ordersQuery, ordersStatus]);

  const refreshMeals = useCallback(async () => {
    if (!kitchen?.id) return;
    await dispatch(fetchMeals({ page: 1, per_page: 200, kitchen_id: kitchen.id }));
  }, [dispatch, kitchen?.id]);

  const refreshOrders = useCallback(async () => {
    if (!kitchen?.id) return;
    await dispatch(
      fetchOrders({
        kitchen_id: kitchen.id,
        per_page: 50,
        page: 1,
        status: "AWAITING_ACKNOWLEDGEMENT",
        as_kitchen: true,
      })
    );
  }, [dispatch, kitchen?.id]);

  const updatingMap = useMemo(() => {
    const raw = ordersState.updateItemStatus || {};
    return Object.keys(raw).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = raw[key] === "loading";
      return acc;
    }, {});
  }, [ordersState.updateItemStatus]);

  return {
    isDark,
    kitchen,
    kitchenStatus,
    meals,
    mealsStatus,
    orders,
    ordersStatus,
    refreshMeals,
    refreshOrders,
    updatingMap,
  };
}
