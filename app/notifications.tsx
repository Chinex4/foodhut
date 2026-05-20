import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "@/components/ui/toast";
import {
  selectNotificationsError,
  selectNotificationsList,
  selectNotificationsListStatus,
  selectUnreadNotificationsCount,
} from "@/redux/notifications/notifications.selectors";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/redux/notifications/notifications.thunks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const notifications = useAppSelector(selectNotificationsList);
  const status = useAppSelector(selectNotificationsListStatus);
  const error = useAppSelector(selectNotificationsError);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const loading = status === "loading";

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const refresh = () => dispatch(fetchNotifications());

  const markOne = async (id: string) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
    } catch (err: any) {
      showError(err);
    }
  };

  const markAll = async () => {
    try {
      const res = await dispatch(markAllNotificationsRead()).unwrap();
      showSuccess(res.message);
    } catch (err: any) {
      showError(err);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={isDark ? "#E5E7EB" : "#111827"} />
          </Pressable>
          <View>
            <Text className={`text-[22px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              Notifications
            </Text>
            <Text className={isDark ? "text-neutral-400" : "text-neutral-500"}>
              {unreadCount} unread
            </Text>
          </View>
        </View>
        <Pressable onPress={markAll} disabled={!unreadCount}>
          <Text className={`font-satoshiBold ${unreadCount ? "text-primary" : "text-neutral-400"}`}>
            Read all
          </Text>
        </Pressable>
      </View>

      {loading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffa800" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="notifications-outline" size={30} color={isDark ? "#6B7280" : "#9CA3AF"} />
              <Text className={`mt-3 font-satoshiMedium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                {error || "No notifications yet."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => !item.read && markOne(item.id)}
              className={`rounded-2xl p-4 mb-3 border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              <View className="flex-row">
                <View className={`mt-1 w-2 h-2 rounded-full ${item.read ? "bg-neutral-400" : "bg-primary"}`} />
                <View className="ml-3 flex-1">
                  <Text className={`font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {item.title}
                  </Text>
                  {item.body ? (
                    <Text className={`mt-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                      {item.body}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
