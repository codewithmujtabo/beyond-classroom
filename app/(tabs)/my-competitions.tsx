import { COMPETITIONS } from "@/constants/competitions";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import React, {
    useEffect,
    useState,
} from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  "Upcoming",
  "Ongoing",
  "Completed",
] as const;
type TabType = (typeof TABS)[number];

// ...existing code...

export default function MyCompetitionsScreen() {
  const {
    user,
    registrations,
    markRegistrationPaid,
    lastRegisteredId,
    clearLastRegistered,
  } = useUser();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] =
    useState<TabType>("Upcoming");
  const [toast, setToast] = useState<
    string | null
  >(null);

  // Show toast when a registration is created via context
  useEffect(() => {
    if (lastRegisteredId) {
      const comp = COMPETITIONS.find(
        (c) =>
          c.id === lastRegisteredId,
      );
      setToast(
        comp
          ? `Registered for ${comp.title}`
          : "Registered",
      );
      setTimeout(() => {
        clearLastRegistered &&
          clearLastRegistered();
        setToast(null);
      }, 2500);
    }
  }, [
    lastRegisteredId,
    clearLastRegistered,
  ]);

  const regsForTab =
    registrations.filter((r) => {
      if (activeTab === "Upcoming")
        return (
          r.status === "registered"
        );
      if (activeTab === "Ongoing")
        return r.status === "paid";
      return r.status === "completed";
    });

  const items = regsForTab.map((r) => ({
    ...r,
    comp: COMPETITIONS.find(
      (c) => c.id === r.compId,
    ),
  }));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: 24,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          My Competitions
        </Text>
        <Text style={styles.subtitle}>
          Track your registrations &
          results
        </Text>
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text
            style={styles.toastText}
          >
            {toast}
          </Text>
        </View>
      )}

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabBtn,
              activeTab === tab &&
                styles.tabBtnActive,
            ]}
            onPress={() =>
              setActiveTab(tab)
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab &&
                  styles.tabBtnTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View
          style={styles.placeholder}
        >
          <Text
            style={
              styles.placeholderEmoji
            }
          >
            📋
          </Text>
          <Text
            style={
              styles.placeholderTitle
            }
          >
            No competitions yet
          </Text>
          <Text
            style={
              styles.placeholderText
            }
          >
            Register for a competition
            and it will
            {"\n"}appear here to track
            your journey.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.regCard}
              activeOpacity={0.8}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    marginRight: 12,
                  }}
                >
                  {item.comp?.image ??
                    "🏆"}
                </Text>
                <View>
                  <Text
                    style={{
                      fontWeight: "800",
                      color: "#0F172A",
                    }}
                  >
                    {item.comp?.title ??
                      "Unknown"}
                  </Text>
                  <Text
                    style={{
                      color: "#64748B",
                      marginTop: 4,
                    }}
                  >
                    {item.comp
                      ?.organizer ?? ""}
                  </Text>
                </View>
              </View>
              <View
                style={{ marginTop: 8 }}
              >
                <Text
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  Status: {item.status}
                </Text>
                {item.status ===
                  "registered" && (
                  <TouchableOpacity
                    onPress={() =>
                      markRegistrationPaid(
                        item.id,
                      )
                    }
                    style={{
                      marginTop: 8,
                      alignSelf:
                        "flex-start",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        color:
                          Brand.primary,
                        fontWeight:
                          "700",
                      }}
                    >
                      Mark Paid
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{ height: 12 }}
            />
          )}
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  tabBtnTextActive: {
    color: Brand.primary,
  },
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
  placeholderEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  toast: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 12,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
  },
});
