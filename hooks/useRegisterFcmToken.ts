// hooks/useRegisterPushToken.ts
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerPushToken } from "@/redux/notifications/notifications.thunks";
import {
  selectPushToken,
  selectPushRegisterStatus,
} from "@/redux/notifications/notifications.selectors";

// Optional: notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getDevicePushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  // Ask for permission
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // This gives you the native push token:
  // - FCM token on Android
  // - APNs token on iOS
  const deviceToken = await Notifications.getDevicePushTokenAsync();
  return deviceToken?.data ?? null;
}

export function useRegisterPushToken() {
  const dispatch = useAppDispatch();
  const lastToken = useAppSelector(selectPushToken);
  const status = useAppSelector(selectPushRegisterStatus);

  useEffect(() => {
    let subscription: Notifications.Subscription | undefined;

    const setup = async () => {
      const token = await getDevicePushToken();
      if (!token) return;

      if (token !== lastToken && status !== "loading") {
        // This is where you send it to your backend
        dispatch(registerPushToken({ token }));
      }

      // If you want to react to notifications when app is open
      subscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          // handle foreground notification if you want
        }
      );
    };

    setup();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [dispatch, lastToken, status]);
}
