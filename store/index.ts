import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/auth/auth.slice";
import usersReducer from "@/redux/users/users.slice";
import kitchenReducer from "@/redux/kitchen/kitchen.slice";
import mealsReducer from "@/redux/meals/meals.slice";
import dashboardReducer from "@/redux/dashboard/dashboard.slice";
import notificationsReducer from "@/redux/notifications/notifications.slice";
import adsReducer from "@/redux/ads/ads.slice";
import cartReducer from "@/redux/cart/cart.slice";
import ordersReducer from "@/redux/orders/orders.slice";
import walletReducer from "@/redux/wallet/wallet.slice";
import transactionsReducer from "@/redux/transactions/transactions.slice";
import searchReducer from "@/redux/search/search.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    kitchen: kitchenReducer,
    meals: mealsReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    ads: adsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    wallet: walletReducer,
    transactions: transactionsReducer,
    search: searchReducer,
  },
  middleware: (gdm) =>
    gdm({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type RootStore = typeof store;
