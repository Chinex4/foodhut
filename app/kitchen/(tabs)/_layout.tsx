import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export default function KitchenTabLayout() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const tint = isDark ? "#fbbf24" : "#ffa800";
  const inactive = isDark ? "#9CA3AF" : "#8E8E93";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 18, default: 14 }),
          backgroundColor: isDark ? "#0a0a0a" : "#FFF8EC",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1f2937" : "#f3f4f6",
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Satoshi-Medium",
          fontSize: 13,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag-handle-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
