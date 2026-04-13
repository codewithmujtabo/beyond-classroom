import {
  Brand,
  CategoryAccent,
  CategoryBg,
  CategoryEmoji,
  GradeBg,
  GradeText,
} from "@/constants/theme";
import { useUser } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as competitionsService from "@/services/competitions.service";
import { Analytics } from "@/services/analytics";

const GRADES = ["SD", "SMP", "SMA"] as const;

function formatPrice(fee: number) {
  return fee === 0 ? "GRATIS" : `Rp ${fee.toLocaleString("id-ID")}`;
}

function formatDeadline(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDeadlineStatus(
  date: string | null
): { label: string; color: string; bg: string } | null {
  if (!date) return null;
  const days = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return null;
  if (days <= 3)
    return { label: `‼ ${days} hari lagi`, color: "#fff", bg: "#EF4444" };
  if (days <= 7)
    return {
      label: `⚡ ${days} hari lagi`,
      color: "#92400E",
      bg: "#FEF3C7",
    };
  if (days <= 14)
    return { label: `${days} hari lagi`, color: "#713F12", bg: "#FDE68A" };
  return null;
}

/** Skeleton card shown while loading */
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeleton]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={styles.skeletonCircle} />
        <View style={{ flex: 1 }}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "55%", marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: "35%", marginTop: 8 }]} />
        </View>
      </View>
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);

  const displayName =
    (user as any)?.fullName?.split(" ")[0] ??
    (user as any)?.name?.split(" ")[0] ??
    "Kamu";

  const {
    data: allCompetitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["competitions"],
    queryFn: () => competitionsService.list(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const categories = useMemo(() => {
    const cats = [...new Set(allCompetitions.map((c) => c.category))].sort();
    return cats;
  }, [allCompetitions]);

  const filtered = useMemo(() => {
    return allCompetitions.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (gradeFilter && !c.gradeLevel.includes(gradeFilter)) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [allCompetitions, query, activeCategory, gradeFilter]);

  const ListHeader = () => (
    <View>
      {/* Personalized greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Halo, {displayName}! 👋</Text>
        <Text style={styles.greetingSubtitle}>
          {isLoading
            ? "Mencari lomba untukmu..."
            : `${allCompetitions.length} lomba tersedia untukmu`}
        </Text>
      </View>

      {/* Search bar */}
      <TextInput
        placeholder="Cari nama lomba..."
        placeholderTextColor="#94A3B8"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      {/* Category chips */}
      {categories.length > 0 && (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.chips}
          renderItem={({ item: cat }) => {
            const isActive = activeCategory === cat;
            const accent = CategoryAccent[cat] ?? Brand.primary;
            const bg = CategoryBg[cat] ?? "#F1F5F9";
            return (
              <Pressable
                onPress={() =>
                  setActiveCategory((p) => (p === cat ? null : cat))
                }
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: accent, borderColor: accent }
                    : { backgroundColor: bg, borderColor: "transparent" },
                ]}
              >
                <Text style={styles.chipEmoji}>
                  {CategoryEmoji[cat] ?? "🏆"}
                </Text>
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isActive ? "#fff" : accent },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      {/* Grade filter */}
      <View style={styles.gradeRow}>
        {GRADES.map((g) => {
          const isActive = gradeFilter === g;
          return (
            <Pressable
              key={g}
              onPress={() => setGradeFilter((p) => (p === g ? null : g))}
              style={[
                styles.gradeBtn,
                isActive
                  ? {
                      backgroundColor: GradeBg[g],
                      borderColor: GradeText[g],
                    }
                  : {},
              ]}
            >
              <Text
                style={[
                  styles.gradeText,
                  { color: isActive ? GradeText[g] : "#64748B" },
                ]}
              >
                {g}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>
        {isLoading ? "Memuat..." : `Tersedia (${filtered.length})`}
      </Text>
    </View>
  );

  if (isError) {
    return (
      <View
        style={[styles.container, styles.center, { paddingTop: insets.top }]}
      >
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>Gagal memuat lomba</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3, 4].map((k) => (
                <View key={k}>
                  <SkeletonCard />
                  <View style={{ height: 12 }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyText}>Lomba tidak ditemukan</Text>
              <Text style={styles.emptySubtext}>
                Coba ubah filter atau kata kunci
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const accent = CategoryAccent[item.category] ?? Brand.primary;
          const catBg = CategoryBg[item.category] ?? "#F5F8FF";
          const emoji = CategoryEmoji[item.category] ?? "🏆";
          const urgency = getDeadlineStatus(item.regCloseDate);
          const grades = item.gradeLevel
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean);

          return (
            <Pressable
              style={[styles.card, { borderLeftColor: accent }]}
              onPress={() => {
                Analytics.track("competition_viewed", {
                  competitionId: item.id,
                  name: item.name,
                  category: item.category,
                });
                router.push({
                  pathname: "/(tabs)/competitions/[id]",
                  params: { id: item.id },
                });
              }}
            >
              <View style={styles.cardTop}>
                {/* Emoji inside a colored circle */}
                <View style={[styles.emojiCircle, { backgroundColor: catBg }]}>
                  <Text style={styles.cardEmoji}>{emoji}</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardOrg}>{item.organizerName}</Text>

                  {/* Grade pills */}
                  {grades.length > 0 && (
                    <View style={styles.gradePillRow}>
                      {grades.map((g) => (
                        <View
                          key={g}
                          style={[
                            styles.gradePill,
                            { backgroundColor: GradeBg[g] ?? "#F1F5F9" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.gradePillText,
                              { color: GradeText[g] ?? "#475569" },
                            ]}
                          >
                            {g}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Deadline urgency badge */}
              {urgency && (
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: urgency.bg },
                  ]}
                >
                  <Text
                    style={[styles.urgencyText, { color: urgency.color }]}
                  >
                    {urgency.label}
                  </Text>
                </View>
              )}

              {/* Deadline text (always) */}
              {!urgency && item.regCloseDate && (
                <Text style={styles.deadlineText}>
                  Tutup {formatDeadline(item.regCloseDate)}
                </Text>
              )}

              <View style={styles.cardFooter}>
                {item.fee === 0 ? (
                  <View style={styles.gratisBadge}>
                    <Text style={styles.gratisText}>GRATIS</Text>
                  </View>
                ) : (
                  <Text style={styles.cardPrice}>
                    Rp {item.fee.toLocaleString("id-ID")}
                  </Text>
                )}
                <Text style={[styles.cardAction, { color: accent }]}>
                  Lihat Detail →
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Greeting
  greeting: { paddingHorizontal: 4, marginBottom: 16, marginTop: 14 },
  greetingText: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  greetingSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },

  // Search
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // Category chips
  chips: { paddingBottom: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  chipEmoji: { marginRight: 5, fontSize: 14 },
  chipLabel: { fontWeight: "700", fontSize: 13 },

  // Grade filter
  gradeRow: { flexDirection: "row", marginTop: 2, marginBottom: 10 },
  gradeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  gradeText: { fontWeight: "700", fontSize: 13 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Competition card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 21,
  },
  cardOrg: { fontSize: 12, color: "#64748B", marginTop: 3 },

  // Grade pills
  gradePillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 4 },
  gradePill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradePillText: { fontSize: 11, fontWeight: "700" },

  // Deadline urgency
  urgencyBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  urgencyText: { fontSize: 12, fontWeight: "700" },
  deadlineText: { fontSize: 12, color: "#94A3B8", marginTop: 8 },

  // Card footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  gratisBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gratisText: { color: "#065F46", fontWeight: "800", fontSize: 13 },
  cardPrice: { fontWeight: "800", color: "#0F172A", fontSize: 14 },
  cardAction: { fontWeight: "700", fontSize: 13 },

  // Skeleton
  skeleton: { opacity: 0.55 },
  skeletonCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    marginRight: 12,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    width: "80%",
  },

  // Error / empty
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: "#64748B", marginBottom: 16 },
  retryBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyText: { fontSize: 15, color: "#475569", fontWeight: "700" },
  emptySubtext: { fontSize: 13, color: "#94A3B8", marginTop: 4 },
});
