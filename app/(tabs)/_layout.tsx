import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/constants/theme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Android gesture bar lives below the tab bar — add its height as padding
  const tabBarHeight =
    Platform.OS === "ios"
      ? 85
      : 60 + insets.bottom;
  const tabBarPaddingBottom =
    Platform.OS === "ios"
      ? 28
      : insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          Brand.primary,
        tabBarInactiveTintColor:
          "#94A3B8",
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom:
            tabBarPaddingBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="competitions"
        options={{
          title: "Competitions",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="trophy.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-competitions"
        options={{
          title: "My Comps",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="checkmark.seal.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="newspaper.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="competitions/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
