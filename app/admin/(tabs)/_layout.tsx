import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";

export default function AdminTabsLayout() {
  const tint = "#ffa800"; // primary
  const inactive = "#8E8E93";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        tabBarBackground: () => <GlassTabBarBackground isDark={false} />,
        tabBarStyle: {
          height: Platform.select({ ios: 66, default: 78 }),
          paddingTop: Platform.select({ ios: 4, default: 8 }),
          paddingBottom: Platform.select({ ios: 8, default: 14 }),
          backgroundColor: "transparent",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.7)",
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Satoshi-Medium",
          fontSize: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
