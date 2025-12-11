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
} from "@/redux/meals/meals.selectors";
import { fetchMeals } from "@/redux/meals/meals.thunks";
import {
  selectOrdersList,
  selectOrdersListStatus,
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

  const orders = useAppSelector(selectOrdersList);
  const ordersStatus = useAppSelector(selectOrdersListStatus);
  const ordersState = useAppSelector(selectOrdersState);

  useEffect(() => {
    if (!kitchen) {
      dispatch(fetchKitchenProfile());
    }
  }, [dispatch, kitchen]);

  useEffect(() => {
    if (kitchen && mealsStatus === "idle") {
      dispatch(fetchMeals({ page: 1, per_page: 200 }));
    }
  }, [dispatch, kitchen, mealsStatus]);

  useEffect(() => {
    if (kitchen?.id && ordersStatus === "idle") {
      dispatch(fetchOrders({ kitchen_id: kitchen.id, per_page: 50 }));
    }
  }, [dispatch, kitchen?.id, ordersStatus]);

  const refreshMeals = useCallback(async () => {
    await dispatch(fetchMeals({ page: 1, per_page: 200 }));
  }, [dispatch]);

  const refreshOrders = useCallback(async () => {
    if (!kitchen?.id) return;
    await dispatch(fetchOrders({ kitchen_id: kitchen.id, per_page: 50 }));
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
