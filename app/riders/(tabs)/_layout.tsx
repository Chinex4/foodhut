import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";

export default function RiderTabsLayout() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const tint = isDark ? "#fbbf24" : "#ffa800";
  const inactive = isDark ? "#9CA3AF" : "#8E8E93";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: tint,
          tabBarInactiveTintColor: inactive,
          tabBarBackground: () => <GlassTabBarBackground isDark={isDark} />,
          tabBarStyle: {
            height: Platform.select({ ios: 66, default: 78 }),
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
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search/index"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rides/index"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <Ionicons name="bicycle-outline" size={24} color={color} />
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
    </>
  );
}
