/**
 * Notifications tab — in-app inbox (E06).
 * Sprint 3 will wire real push notifications, registration status updates,
 * and the full bell-icon notification centre here.
 * For now: empty state with a placeholder message.
 */

import { Brand } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyBody}>
          Registration updates, deadline reminders, and new competition alerts
          will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
