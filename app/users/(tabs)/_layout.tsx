// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform } from "react-native";

export default function TabLayout() {
  const tint = "#ffa800"; // primary
  const inactive = "#8E8E93";

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
          backgroundColor: "#FFF8EC", // a soft off-white like your mock
          borderTopWidth: 0,
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
