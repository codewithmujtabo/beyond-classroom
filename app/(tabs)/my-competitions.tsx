import { Brand, CategoryAccent, CategoryBg, CategoryEmoji } from "@/constants/theme";
import { useUser } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["Upcoming", "Ongoing", "Completed"] as const;
type TabType = (typeof TABS)[number];

const STATUS_CFG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  registered: {
    label: "⏳ Menunggu Pembayaran",
    bg: "#FEF3C7",
    color: "#92400E",
  },
  paid: { label: "✅ Aktif", bg: "#D1FAE5", color: "#065F46" },
  completed: { label: "🎓 Selesai", bg: "#DBEAFE", color: "#1E40AF" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? {
    label: status,
    bg: "#F1F5F9",
    color: "#475569",
  };
  return (
    <View
      style={[styles.statusBadge, { backgroundColor: c.bg }]}
    >
      <Text style={[styles.statusText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

export default function MyCompetitionsScreen() {
  const router = useRouter();
  const {
    registrations,
    lastRegisteredId,
    clearLastRegistered,
    refreshRegistrations,
  } = useUser();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (lastRegisteredId) {
      const reg = registrations.find((r) => r.compId === lastRegisteredId);
      setToast(reg ? `Berhasil daftar: ${reg.competitionName} 🎉` : "Berhasil daftar!");
      setTimeout(() => {
        clearLastRegistered && clearLastRegistered();
        setToast(null);
      }, 3000);
    }
  }, [lastRegisteredId, clearLastRegistered]);

  const regsForTab = registrations.filter((r) => {
    if (activeTab === "Upcoming") return r.status === "registered";
    if (activeTab === "Ongoing") return r.status === "paid";
    return r.status === "completed";
  });

  const tabCounts = {
    Upcoming: registrations.filter((r) => r.status === "registered").length,
    Ongoing: registrations.filter((r) => r.status === "paid").length,
    Completed: registrations.filter((r) => r.status === "completed").length,
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: 24 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Lombaku</Text>
        <Text style={styles.subtitle}>Pantau pendaftaran & hasilmu</Text>
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Tab row with counts */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab && styles.tabBtnTextActive,
              ]}
            >
              {tab}
            </Text>
            {tabCounts[tab] > 0 && (
              <View
                style={[
                  styles.tabCount,
                  activeTab === tab
                    ? { backgroundColor: Brand.primary }
                    : { backgroundColor: "#E2E8F0" },
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    { color: activeTab === tab ? "#fff" : "#64748B" },
                  ]}
                >
                  {tabCounts[tab]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {regsForTab.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📋</Text>
          <Text style={styles.placeholderTitle}>Belum ada lomba</Text>
          <Text style={styles.placeholderText}>
            Daftar lomba dan semuanya{"\n"}akan muncul di sini.
          </Text>
        </View>
      ) : (
        <FlatList
          data={regsForTab}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refreshRegistrations();
                setRefreshing(false);
              }}
              tintColor={Brand.primary}
            />
          }
          renderItem={({ item }) => {
            const category = (item.meta as any)?.category as string | undefined;
            const accent = CategoryAccent[category ?? ""] ?? Brand.primary;
            const catBg = CategoryBg[category ?? ""] ?? "#EEF2FF";
            const emoji = CategoryEmoji[category ?? ""] ?? "🏆";

            return (
              <TouchableOpacity
                style={[styles.regCard, { borderLeftColor: accent }]}
                activeOpacity={0.8}
              >
                <View style={styles.regCardInner}>
                  <View style={[styles.regEmoji, { backgroundColor: catBg }]}>
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.regCardTitle} numberOfLines={2}>
                      {item.competitionName}
                    </Text>
                    <Text style={styles.regCardFee}>
                      {item.fee === 0
                        ? "Gratis"
                        : `Rp ${item.fee.toLocaleString("id-ID")}`}
                    </Text>
                    <StatusBadge status={item.status} />
                  </View>
                </View>

                {item.status === "registered" && item.fee > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(payment)/pay",
                        params: { registrationId: item.id },
                      })
                    }
                    style={styles.payBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.payBtnText}>
                      Lanjutkan Pembayaran →
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748B" },

  toast: {
    backgroundColor: "#065F46",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: "#94A3B8" },
  tabBtnTextActive: { color: Brand.primary },
  tabCount: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountText: { fontSize: 10, fontWeight: "800" },

  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  placeholderEmoji: { fontSize: 52, marginBottom: 16 },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },

  regCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  regCardInner: { flexDirection: "row", alignItems: "flex-start" },
  regEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  regCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 21,
  },
  regCardFee: { fontSize: 13, color: "#64748B", marginTop: 3 },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  payBtn: {
    marginTop: 12,
    backgroundColor: Brand.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
