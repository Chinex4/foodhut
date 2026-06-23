// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";

export default function TabLayout() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const tint = isDark ? "#fbbf24" : "#ffa800"; // primary
  const inactive = isDark ? "#9CA3AF" : "#8E8E93";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        tabBarBackground: () => <GlassTabBarBackground isDark={isDark} />,
        tabBarStyle: {
          height: Platform.select({ ios: 70, default: 78 }),
          paddingTop: Platform.select({ ios: 4, default: 8 }),
          paddingBottom: Platform.select({ ios: 8, default: 14 }),
          backgroundColor: "transparent",
          borderTopWidth: 1,
          borderTopColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.7)",
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
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={26} color={color} />
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
        name="support/index"
        options={{
          title: "Support",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={26} color={color} />
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
