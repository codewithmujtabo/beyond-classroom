import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Brand } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TeacherActionsScreen() {
  const quickActions = [
    {
      id: "bulk-register",
      icon: "person.3.fill",
      title: "Bulk Registration",
      subtitle: "Register multiple students at once",
      color: "#4F46E5",
      onPress: () => router.push("/bulk-registration"),
    },
    {
      id: "export-data",
      icon: "arrow.down.doc.fill",
      title: "Export Student Data",
      subtitle: "Download CSV of all students",
      color: "#10B981",
      onPress: () => {
        // Handle export
        console.log("Export data");
      },
    },
    {
      id: "send-reminder",
      icon: "bell.badge.fill",
      title: "Send Reminder",
      subtitle: "Notify students about deadlines",
      color: "#F59E0B",
      onPress: () => {
        // Handle reminder
        console.log("Send reminder");
      },
    },
    {
      id: "view-reports",
      icon: "chart.bar.fill",
      title: "View Reports",
      subtitle: "Detailed performance reports",
      color: "#8B5CF6",
      onPress: () => {
        // Navigate to reports
        console.log("View reports");
      },
    },
  ];

  const recentActivities = [
    {
      id: "1",
      action: "Bulk registered 15 students",
      competition: "National Math Olympiad",
      time: "2 hours ago",
      icon: "checkmark.circle.fill",
      color: "#10B981",
    },
    {
      id: "2",
      action: "Exported student data",
      competition: "All students (Grade 10)",
      time: "1 day ago",
      icon: "arrow.down.circle.fill",
      color: "#4F46E5",
    },
    {
      id: "3",
      action: "Sent deadline reminder",
      competition: "Science Fair 2026",
      time: "2 days ago",
      icon: "bell.fill",
      color: "#F59E0B",
    },
  ];

  const upcomingDeadlines = [
    {
      id: "1",
      competition: "National Math Olympiad",
      deadline: "Apr 22, 2026",
      daysLeft: 4,
      registeredCount: 12,
      status: "urgent",
    },
    {
      id: "2",
      competition: "Science Fair 2026",
      deadline: "Apr 28, 2026",
      daysLeft: 10,
      registeredCount: 8,
      status: "upcoming",
    },
    {
      id: "3",
      competition: "English Debate Competition",
      deadline: "May 5, 2026",
      daysLeft: 17,
      registeredCount: 5,
      status: "upcoming",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Actions</Text>
          <Text style={styles.headerSubtitle}>
            Fast access to common tasks
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}
              >
                <IconSymbol
                  name={action.icon as any}
                  size={28}
                  color={action.color}
                />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          <Text style={styles.sectionSubtitle}>
            Competitions closing soon
          </Text>

          {upcomingDeadlines.map((item) => (
            <View key={item.id} style={styles.deadlineCard}>
              <View style={styles.deadlineHeader}>
                <View style={styles.deadlineInfo}>
                  <Text style={styles.deadlineName}>{item.competition}</Text>
                  <Text style={styles.deadlineDate}>{item.deadline}</Text>
                </View>
                <View
                  style={[
                    styles.deadlineBadge,
                    {
                      backgroundColor:
                        item.status === "urgent" ? "#FEE2E2" : "#DBEAFE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.deadlineBadgeText,
                      {
                        color: item.status === "urgent" ? "#EF4444" : "#3B82F6",
                      },
                    ]}
                  >
                    {item.daysLeft}d left
                  </Text>
                </View>
              </View>

              <View style={styles.deadlineFooter}>
                <IconSymbol name="person.2.fill" size={16} color="#64748B" />
                <Text style={styles.deadlineCount}>
                  {item.registeredCount} students registered
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Text style={styles.sectionSubtitle}>
            Your recent actions and updates
          </Text>

          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${activity.color}15` },
                ]}
              >
                <IconSymbol
                  name={activity.icon as any}
                  size={20}
                  color={activity.color}
                />
              </View>

              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityCompetition}>
                  {activity.competition}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  deadlineCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deadlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 13,
    color: "#64748B",
  },
  deadlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deadlineBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  deadlineCount: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityCompetition: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
