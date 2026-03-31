import {
  BANNERS,
  CATEGORIES,
  COMPETITIONS,
} from "@/constants/competitions";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import React, {
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } =
  Dimensions.get("window");

function BannerCarousel({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const [active, setActive] =
    useState(0);
  const ref = useRef<FlatList>(null);

  const onScroll = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x /
        (SCREEN_W - 32),
    );
    setActive(idx);
  };

  return (
    <View>
      <FlatList
        ref={ref}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.banner,
              {
                backgroundColor:
                  item.color,
                width: SCREEN_W - 32,
              },
            ]}
          >
            <View
              style={
                styles.bannerContent
              }
            >
              <Text
                style={
                  styles.bannerEmoji
                }
              >
                {item.emoji}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.bannerTitle
                  }
                >
                  {item.title}
                </Text>
                <Text
                  style={
                    styles.bannerSub
                  }
                >
                  {item.subtitle}
                </Text>
                <Pressable
                  style={[
                    styles.bannerBtn,
                    {
                      backgroundColor:
                        item.accent,
                    },
                  ]}
                  onPress={onRegister}
                >
                  <Text
                    style={
                      styles.bannerBtnText
                    }
                  >
                    Register →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === active
                    ? Brand.primary
                    : "#CBD5E1",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryChip({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        active && styles.chipActive,
      ]}
      onPress={onPress}
    >
      <Text style={styles.chipEmoji}>
        {emoji}
      </Text>
      <Text
        style={[
          styles.chipLabel,
          active &&
            styles.chipLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CompCard({
  item,
  onPress,
}: {
  item: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: item.color },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardEmoji}>
          {item.image}
        </Text>
        <View
          style={styles.categoryBadge}
        >
          <Text
            style={
              styles.categoryBadgeText
            }
          >
            {item.category}
          </Text>
        </View>
      </View>
      <Text
        style={styles.cardTitle}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text
        style={styles.cardOrg}
        numberOfLines={1}
      >
        {item.organizer}
      </Text>
      <View style={styles.cardMeta}>
        <Text
          style={styles.cardMetaText}
        >
          🎓 {item.grade.join(", ")}
        </Text>
        <Text
          style={styles.cardMetaText}
        >
          ⏰ {item.deadline}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>
          {item.price === 0
            ? "🆓 Free"
            : `Rp ${item.price.toLocaleString("id-ID")}`}
        </Text>
        <Pressable
          style={styles.cardBtn}
          onPress={onPress}
        >
          <Text
            style={styles.cardBtnText}
          >
            Detail
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>
            See all
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] =
    useState("");

  const isStudent =
    user?.role === "student";

  const toggleCategory = (
    label: string,
  ) =>
    setActiveCategory((prev) =>
      prev === label ? null : label,
    );

  const gradeFiltered =
    COMPETITIONS.filter(
      (c) =>
        !isStudent ||
        c.grade.includes(
          user?.level ?? "SMP",
        ),
    );
  const categoryFiltered =
    activeCategory
      ? gradeFiltered.filter(
          (c) =>
            c.category ===
            activeCategory,
        )
      : gradeFiltered;
  const searchFiltered =
    searchQuery.trim()
      ? categoryFiltered.filter(
          (c) =>
            c.title
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase(),
              ) ||
            c.organizer
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase(),
              ) ||
            c.category
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase(),
              ),
        )
      : categoryFiltered;

  const recommended =
    searchFiltered.slice(0, 6);
  const byDeadline = [...searchFiltered]
    .sort(
      (a, b) =>
        a.deadlineDate.getTime() -
        b.deadlineDate.getTime(),
    )
    .slice(0, 6);
  const popular = [...searchFiltered]
    .reverse()
    .slice(0, 6);

  const goToCompetitions = () =>
    router.push("/(tabs)/competitions");

  const goToCompetitionDetail = (
    id: string,
  ) =>
    router.push({
      pathname:
        "/(tabs)/competitions/[id]",
      params: { id, from: "home" },
    });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            marginRight: 12,
          }}
        >
          <Text style={styles.greeting}>
            Hello,
          </Text>
          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {user?.name?.split(
              " ",
            )[0] ?? "User"}
          </Text>
          <Text
            style={styles.userMeta}
            numberOfLines={1}
          >
            {user?.school ?? ""}
          </Text>
        </View>
        <Pressable
          style={styles.avatarBtn}
          onPress={() =>
            router.push(
              "/(tabs)/profile",
            )
          }
        >
          {user?.avatarUrl ? (
            <Image
              source={{
                uri: user.avatarUrl,
              }}
              style={styles.avatarImg}
            />
          ) : (
            <Text
              style={
                styles.avatarInitial
              }
            >
              {user?.name
                ?.charAt(0)
                .toUpperCase() ?? "?"}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.searchWrap}>
          <Text
            style={styles.searchIcon}
          >
            🔍
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search competitions..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() =>
                setSearchQuery("")
              }
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#94A3B8",
                  paddingLeft: 8,
                }}
              >
                ✕
              </Text>
            </Pressable>
          )}
        </View>

        {searchQuery.length === 0 && (
          <BannerCarousel
            onRegister={
              goToCompetitions
            }
          />
        )}

        <SectionHeader title="Categories" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.categoryRow}
        >
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.label}
              label={c.label}
              emoji={c.emoji}
              active={
                activeCategory ===
                c.label
              }
              onPress={() =>
                toggleCategory(c.label)
              }
            />
          ))}
        </ScrollView>

        {recommended.length > 0 && (
          <>
            <SectionHeader
              title="Recommended"
              onSeeAll={
                goToCompetitions
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={styles.cardRow}
            >
              {recommended.map(
                (item) => (
                  <CompCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      goToCompetitionDetail(
                        item.id,
                      )
                    }
                  />
                ),
              )}
            </ScrollView>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: Brand.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: "#C7D2FE",
    fontWeight: "500",
  },
  userName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "800",
    marginTop: 2,
  },
  userMeta: {
    fontSize: 12,
    color: "#A5B4FC",
    marginTop: 4,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor:
      "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    overflow: "hidden",
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginTop: -14,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  banner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
    marginRight: 0,
    overflow: "hidden",
    height: 140,
    justifyContent: "center",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerEmoji: { fontSize: 48 },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  bannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 18,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryRow: { marginBottom: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  chipLabelActive: { color: "#fff" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  seeAll: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "600",
  },
  cardRow: { marginBottom: 8 },
  card: {
    width: 200,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardEmoji: { fontSize: 32 },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.07)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },
  cardOrg: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 6,
  },
  cardMeta: { marginBottom: 10 },
  cardMetaText: {
    fontSize: 11,
    color: "#475569",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  // Role banner
  roleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
  },
  roleBannerEmoji: { fontSize: 28 },
  roleBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  roleBannerSub: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
