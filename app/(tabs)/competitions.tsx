import { Brand } from "@/constants/theme";
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

const CATEGORY_EMOJIS: Record<string, string> = {
  Math: "📐",
  Science: "🔬",
  Debate: "🎤",
  Arts: "🎨",
  Language: "📚",
  Technology: "🤖",
  Sports: "⚽",
};

function formatPrice(fee: number) {
  return fee === 0 ? "Free" : `Rp ${fee.toLocaleString("id-ID")}`;
}

function formatDeadline(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Skeleton card shown while loading */
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeleton]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: "60%", marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { width: "40%", marginTop: 8 }]} />
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);

  const { data: allCompetitions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["competitions"],
    queryFn: () => competitionsService.list(),
  });

  // Derive unique categories from API data
  const categories = useMemo(() => {
    const cats = [...new Set(allCompetitions.map((c) => c.category))].sort();
    return cats;
  }, [allCompetitions]);

  // Client-side filtering (data set is small; avoids extra API calls per keystroke)
  const filtered = useMemo(() => {
    return allCompetitions.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (gradeFilter && !c.gradeLevel.includes(gradeFilter)) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [allCompetitions, query, activeCategory, gradeFilter]);

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>
          Browse national &amp; regional competitions
        </Text>
      </View>

      {/* Search bar */}
      <TextInput
        placeholder="Search competitions..."
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
          renderItem={({ item: cat }) => (
            <Pressable
              onPress={() =>
                setActiveCategory((p) => (p === cat ? null : cat))
              }
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
            >
              <Text style={styles.chipEmoji}>
                {CATEGORY_EMOJIS[cat] ?? "🏆"}
              </Text>
              <Text
                style={[
                  styles.chipLabel,
                  activeCategory === cat && styles.chipLabelActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* Grade filter buttons */}
      <View style={styles.gradeRow}>
        {GRADES.map((g) => (
          <Pressable
            key={g}
            onPress={() => setGradeFilter((p) => (p === g ? null : g))}
            style={[styles.gradeBtn, gradeFilter === g && styles.gradeBtnActive]}
          >
            <Text
              style={[
                styles.gradeText,
                gradeFilter === g && styles.gradeTextActive,
              ]}
            >
              {g}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {isLoading
          ? "Loading..."
          : `Available (${filtered.length})`}
      </Text>
    </View>
  );

  if (isError) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Failed to load competitions</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
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
            // Skeleton loaders while fetching
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
              <Text style={styles.emptyText}>No competitions found</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
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
              <Text style={styles.cardEmoji}>
                {CATEGORY_EMOJIS[item.category] ?? "🏆"}
              </Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.cardOrg}>{item.organizerName}</Text>
                <Text style={styles.cardMeta}>
                  {item.category} · {item.gradeLevel.replace(/,/g, ", ")} ·{" "}
                  Tutup {formatDeadline(item.regCloseDate)}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>{formatPrice(item.fee)}</Text>
              <Text style={styles.cardAction}>Lihat Detail →</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingHorizontal: 4, marginBottom: 12, marginTop: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
  },
  chips: { paddingBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  chipEmoji: { marginRight: 6, fontSize: 14 },
  chipLabel: { fontWeight: "600", fontSize: 13, color: "#0F172A" },
  chipLabelActive: { color: "#fff" },
  gradeRow: { flexDirection: "row", marginTop: 4, marginBottom: 8 },
  gradeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gradeBtnActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  gradeText: { fontWeight: "700", color: "#0F172A", fontSize: 13 },
  gradeTextActive: { color: "#fff" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  cardEmoji: { fontSize: 32, marginRight: 12, marginTop: 2 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A", lineHeight: 20 },
  cardOrg: { fontSize: 12, color: "#64748B", marginTop: 3 },
  cardMeta: { fontSize: 12, color: "#94A3B8", marginTop: 5 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardPrice: { fontWeight: "800", color: "#0F172A", fontSize: 14 },
  cardAction: { color: Brand.primary, fontWeight: "700", fontSize: 13 },
  skeleton: { opacity: 0.5 },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    width: "80%",
  },
  errorText: { fontSize: 15, color: "#64748B", marginBottom: 16 },
  retryBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
