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

  // Determine which tabs to show based on role
  const isStudent = userRole === "student";
  const isParent = userRole === "parent";
  const isTeacher = userRole === "teacher";
  const isSchoolAdmin = userRole === "school_admin";

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
      {/* STUDENT & PARENT: Discover tab */}
      <Tabs.Screen
        name="competitions"
        options={{
          title: "Discover",
          href: (isStudent || isParent) ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="trophy.fill" color={color} />
          ),
        }}
      />

      {/* STUDENT ONLY: My Registrations tab */}
      <Tabs.Screen
        name="my-competitions"
        options={{
          title: "My Regs",
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="checkmark.seal.fill" color={color} />
          ),
        }}
      />

      {/* PARENT ONLY: Children tab */}
      <Tabs.Screen
        name="children"
        options={{
          title: "Children",
          href: isParent ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.2.fill" color={color} />
          ),
        }}
      />

      {/* TEACHER ONLY: My Students tab */}
      <Tabs.Screen
        name="teacher-students"
        options={{
          title: "My Students",
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.3.fill" color={color} />
          ),
        }}
      />

      {/* TEACHER ONLY: Analytics tab */}
      <Tabs.Screen
        name="teacher-analytics"
        options={{
          title: "Analytics",
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      {/* TEACHER ONLY: Actions tab */}
      <Tabs.Screen
        name="teacher-actions"
        options={{
          title: "Actions",
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="bolt.fill" color={color} />
          ),
        }}
      />

      {/* ALL ROLES: Notifications tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="bell.fill" color={color} />
          ),
        }}
      />

      {/* ALL ROLES: Profile tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.fill" color={color} />
          ),
        }}
      />

      {/* Always hidden screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="competitions/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/link-parent" options={{ href: null }} />
    </Tabs>
  );
}
