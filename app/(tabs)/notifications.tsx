/**
 * Notifications Screen
 * Sprint 3, Track B, Phase 3 (T8.1-T8.7)
 *
 * In-app notification inbox with read/unread status, pull-to-refresh,
 * swipe-to-delete, and deep linking navigation.
 */

import { Brand } from "@/constants/theme";
import * as notificationsService from "@/services/notifications.service";
import { Notification } from "@/services/notifications.service";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // T8.1, T8.2 — Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const response = await notificationsService.getNotifications(50, 0);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }

  // T8.3 — Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(true);
  }, []);

  // T8.5 — Mark as read and navigate
  async function handleNotificationTap(notification: Notification) {
    // Mark as read if not already
    if (!notification.read) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn("Failed to mark notification as read:", err);
      }
    }

    // Navigate based on notification type
    const data = notification.data || {};
    const compId = data.compId as string;

    switch (notification.type) {
      case "registration_created":
      case "deadline_reminder":
      case "competition_reminder":
        if (compId) {
          router.push(`/(tabs)/competitions/${compId}`);
        }
        break;

      case "payment_success":
        // Navigate to My Registrations → Ongoing tab (paid competitions)
        router.push("/(tabs)/my-competitions?tab=Ongoing");
        break;

      case "payment_pending":
      case "payment_failed":
        // Navigate to My Registrations → Upcoming tab (unpaid/pending competitions)
        router.push("/(tabs)/my-competitions?tab=Upcoming");
        break;

      default:
        console.warn("Unknown notification type:", notification.type);
        break;
    }
  }

  // T8.4 — Swipe-to-delete
  async function handleDelete(notification: Notification) {
    try {
      await notificationsService.deleteNotification(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }

  // T8.6 — Mark all as read
  async function handleMarkAllAsRead() {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  // T8.4 — Render swipe actions
  function renderRightActions(notification: Notification) {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(notification)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  }

  // T8.2 — Render notification item
  function renderNotification({ item }: { item: Notification }) {
    const isUnread = !item.read;
    const date = new Date(item.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity
          style={[styles.notificationItem, isUnread && styles.notificationUnread]}
          onPress={() => handleNotificationTap(item)}
          activeOpacity={0.7}
        >
          {isUnread && <View style={styles.unreadDot} />}
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, isUnread && styles.textBold]}>
              {item.title}
            </Text>
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.notificationTime}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  // T8.7 — Empty state
  if (!loading && notifications.length === 0) {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Brand.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// Helper: Format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  unreadCount: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationUnread: {
    backgroundColor: "#F0F9FF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.primary,
    marginRight: 12,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  textBold: {
    fontWeight: "700",
  },
  notificationBody: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Empty state
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    paddingHorizontal: 20,
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
