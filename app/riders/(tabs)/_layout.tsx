import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

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
          tabBarStyle: {
            height: 78,
            paddingTop: 8,
            paddingBottom: Platform.select({ ios: 18, default: 14 }),
            backgroundColor: isDark ? "#0a0a0a" : "#FFF8EC",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#1f2937" : "#f0e3d0",
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
