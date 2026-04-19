import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "@/constants/theme";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryPie, VictoryAxis } from "victory-native";

const screenWidth = Dimensions.get("window").width;

export default function TeacherAnalyticsScreen() {
  // Mock data - replace with actual API data
  const registrationsByMonth = [
    { month: "Jan", count: 12 },
    { month: "Feb", count: 18 },
    { month: "Mar", count: 25 },
    { month: "Apr", count: 20 },
  ];

  const competitionCategories = [
    { category: "Academic", count: 35, color: "#4F46E5" },
    { category: "Arts", count: 20, color: "#10B981" },
    { category: "Sports", count: 15, color: "#F59E0B" },
    { category: "Debate", count: 10, color: "#EF4444" },
  ];

  const gradeParticipation = [
    { grade: "Grade 10", count: 25 },
    { grade: "Grade 11", count: 30 },
    { grade: "Grade 12", count: 25 },
  ];

  const totalRegistrations = registrationsByMonth.reduce((sum, item) => sum + item.count, 0);
  const activeStudents = 45;
  const averagePerStudent = totalRegistrations / activeStudents;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Track student participation and performance trends
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalRegistrations}</Text>
            <Text style={styles.metricLabel}>Total Registrations</Text>
            <Text style={styles.metricChange}>+12% from last month</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{activeStudents}</Text>
            <Text style={styles.metricLabel}>Active Students</Text>
            <Text style={styles.metricChange}>+5 this month</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{averagePerStudent.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Avg per Student</Text>
            <Text style={styles.metricChange}>+0.3 from last month</Text>
          </View>
        </View>

        {/* Registrations Trend */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Registrations by Month</Text>
          <Text style={styles.chartSubtitle}>Track participation trends over time</Text>

          <VictoryChart
            theme={VictoryTheme.material}
            width={screenWidth - 64}
            height={220}
            domainPadding={{ x: 30 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: "#E2E8F0" },
                tickLabels: { fontSize: 12, fill: "#64748B" },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#E2E8F0" },
                tickLabels: { fontSize: 12, fill: "#64748B" },
                grid: { stroke: "#F1F5F9" },
              }}
            />
            <VictoryBar
              data={registrationsByMonth}
              x="month"
              y="count"
              style={{
                data: { fill: Brand.primary },
              }}
              cornerRadius={{ top: 6 }}
            />
          </VictoryChart>
        </View>

        {/* Competition Categories */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Competition Categories</Text>
          <Text style={styles.chartSubtitle}>Distribution by category type</Text>

          <View style={styles.pieContainer}>
            <VictoryPie
              data={competitionCategories}
              x="category"
              y="count"
              width={screenWidth - 64}
              height={240}
              colorScale={competitionCategories.map((c) => c.color)}
              style={{
                labels: { fontSize: 12, fill: "#1E293B", fontWeight: "600" },
              }}
              labelRadius={({ index }) => 80 - index * 5}
            />
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {competitionCategories.map((item) => (
              <View key={item.category} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>
                  {item.category} ({item.count})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Grade Participation */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Participation by Grade</Text>
          <Text style={styles.chartSubtitle}>Which grades are most active</Text>

          {gradeParticipation.map((item, index) => (
            <View key={item.grade} style={styles.progressRow}>
              <Text style={styles.progressLabel}>{item.grade}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(item.count / 30) * 100}%`,
                      backgroundColor:
                        index === 0
                          ? "#4F46E5"
                          : index === 1
                          ? "#10B981"
                          : "#F59E0B",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>{item.count}</Text>
            </View>
          ))}
        </View>

        {/* Success Rate */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Registration Success Rate</Text>
          <Text style={styles.chartSubtitle}>From submission to confirmed</Text>

          <View style={styles.successMetrics}>
            <View style={styles.successItem}>
              <View style={[styles.successDot, { backgroundColor: "#10B981" }]} />
              <View style={styles.successInfo}>
                <Text style={styles.successLabel}>Confirmed</Text>
                <Text style={styles.successValue}>68%</Text>
              </View>
            </View>
            <View style={styles.successItem}>
              <View style={[styles.successDot, { backgroundColor: "#F59E0B" }]} />
              <View style={styles.successInfo}>
                <Text style={styles.successLabel}>Pending</Text>
                <Text style={styles.successValue}>25%</Text>
              </View>
            </View>
            <View style={styles.successItem}>
              <View style={[styles.successDot, { backgroundColor: "#EF4444" }]} />
              <View style={styles.successInfo}>
                <Text style={styles.successLabel}>Rejected</Text>
                <Text style={styles.successValue}>7%</Text>
              </View>
            </View>
          </View>
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
    marginBottom: 20,
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
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Brand.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  metricChange: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  pieContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#64748B",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressLabel: {
    width: 80,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  progressBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 12,
  },
  progressValue: {
    width: 30,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "right",
  },
  successMetrics: {
    gap: 16,
  },
  successItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  successDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  successInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successLabel: {
    fontSize: 15,
    color: "#64748B",
  },
  successValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
});
