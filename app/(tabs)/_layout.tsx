import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/AuthContext";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const userRole = (user as any)?.role || "student";

  const tabBarHeight =
    Platform.OS === "ios" ? 85 : 60 + insets.bottom;
  const tabBarPaddingBottom =
    Platform.OS === "ios" ? 28 : insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Tab 1 — Discover (students/parents only) */}
      {(userRole === "student" || userRole === "parent") && (
        <Tabs.Screen
          name="competitions"
          options={{
            title: "Discover",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="trophy.fill" color={color} />
            ),
          }}
        />
      )}

      {/* Tab 2 — My Registrations (students only) */}
      {userRole === "student" && (
        <Tabs.Screen
          name="my-competitions"
          options={{
            title: "My Regs",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="checkmark.seal.fill" color={color} />
            ),
          }}
        />
      )}

      {/* Tab 2 — Children (parents only) */}
      {userRole === "parent" && (
        <Tabs.Screen
          name="children"
          options={{
            title: "Children",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="person.2.fill" color={color} />
            ),
          }}
        />
      )}

      {/* Tab 3 — Notifications (all roles) */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="bell.fill" color={color} />
          ),
        }}
      />

      {/* Tab 4 — Profile (all roles) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.fill" color={color} />
          ),
        }}
      />

      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="competitions/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/link-parent" options={{ href: null }} />

      {/* Hide tabs based on role */}
      {userRole !== "parent" && (
        <Tabs.Screen name="children" options={{ href: null }} />
      )}
      {(userRole === "teacher" || userRole === "school_admin") && (
        <>
          <Tabs.Screen name="competitions" options={{ href: null }} />
          <Tabs.Screen name="my-competitions" options={{ href: null }} />
        </>
      )}
    </Tabs>
  );
}
