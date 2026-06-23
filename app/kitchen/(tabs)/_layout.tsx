import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";
import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";

export default function KitchenTabLayout() {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);
  const tint = palette.accent;
  const inactive = palette.textMuted;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        tabBarBackground: () => <GlassTabBarBackground isDark={isDark} />,
        tabBarStyle: {
          height: Platform.select({ ios: 68, default: 84 }),
          paddingTop: Platform.select({ ios: 4, default: 8 }),
          paddingBottom: Platform.select({ ios: 8, default: 14 }),
          backgroundColor: "transparent",
          borderTopWidth: 1,
          borderTopColor: palette.border,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Satoshi-Medium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bag-handle" : "bag-handle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      {/* Hide non-tab routes */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="menu/create" options={{ href: null }} />
      <Tabs.Screen name="menu/[id]" options={{ href: null }} />
    </Tabs>
  );
}
