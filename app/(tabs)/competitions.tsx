import {
  CATEGORIES,
  COMPETITIONS,
} from "@/constants/competitions";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import React, {
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatPrice(p: number) {
  return p === 0
    ? "Free"
    : `Rp ${p.toLocaleString("id-ID")}`;
}

export default function CompetitionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  // removed local router usage to avoid creating navigation side-effects here
  const router = useRouter();
  const [query, setQuery] =
    useState("");
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] =
    useState<string | null>(null);

  const data = useMemo(() => {
    return COMPETITIONS.filter((c) => {
      if (
        activeCategory &&
        c.category !== activeCategory
      )
        return false;
      if (
        gradeFilter &&
        !c.grade.includes(gradeFilter)
      )
        return false;
      if (
        query &&
        !c.title
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    query,
    activeCategory,
    gradeFilter,
  ]);

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>
          Competitions
        </Text>
        <Text style={styles.subtitle}>
          Browse national &
          international competitions
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search competitions"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          keyExtractor={(c) => c.label}
          renderItem={({ item: c }) => (
            <Pressable
              onPress={() =>
                setActiveCategory(
                  (p) =>
                    p === c.label
                      ? null
                      : c.label,
                )
              }
              style={[
                styles.chip,
                activeCategory ===
                  c.label &&
                  styles.chipActive,
              ]}
            >
              <Text
                style={styles.chipEmoji}
              >
                {c.emoji}
              </Text>
              <Text
                style={[
                  styles.chipLabel,
                  activeCategory ===
                    c.label &&
                    styles.chipLabelActive,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.gradeRow}>
        {["SD", "SMP", "SMA"].map(
          (g) => (
            <Pressable
              key={g}
              onPress={() =>
                setGradeFilter((p) =>
                  p === g ? null : g,
                )
              }
              style={[
                styles.gradeBtn,
                gradeFilter === g &&
                  styles.gradeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.gradeText,
                  gradeFilter === g &&
                    styles.gradeTextActive,
                ]}
              >
                {g}
              </Text>
            </Pressable>
          ),
        )}
      </View>

      <Text style={styles.sectionTitle}>
        Available ({data.length})
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              router.push({
                pathname:
                  "/(tabs)/competitions/[id]",
                params: {
                  id: item.id,
                  from: "competitions",
                },
              });
            }}
          >
            <View
              style={styles.cardTop}
            >
              <Text
                style={styles.cardEmoji}
              >
                {item.image}
              </Text>
              <View
                style={styles.cardInfo}
              >
                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {item.title}
                </Text>
                <Text
                  style={styles.cardOrg}
                >
                  {item.organizer}
                </Text>
                <Text
                  style={
                    styles.cardMeta
                  }
                >
                  {item.category} ·{" "}
                  {item.grade.join(
                    ", ",
                  )}{" "}
                  · {item.deadline}
                </Text>
              </View>
            </View>
            <View
              style={styles.cardFooter}
            >
              <Text
                style={styles.cardPrice}
              >
                {formatPrice(
                  item.price,
                )}
              </Text>
              <Pressable
                onPress={() =>
                  router.push(
                    `/(tabs)/competitions/${item.id}`,
                  )
                }
              >
                <Text
                  style={
                    styles.cardAction
                  }
                >
                  View
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 12 }}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  searchRow: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  filterRow: {
    marginTop: 12,
    paddingVertical: 8,
  },
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
  chipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipEmoji: { marginRight: 8 },
  chipLabel: {
    fontWeight: "600",
    color: "#0F172A",
  },
  chipLabelActive: { color: "#fff" },
  gradeRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  gradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gradeBtnActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  gradeText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  gradeTextActive: { color: "#fff" },
  sectionTitle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardOrg: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  cardPrice: {
    fontWeight: "800",
    color: "#0F172A",
  },
  cardAction: {
    color: Brand.primary,
    fontWeight: "700",
  },
});
