import { IconSymbol } from "@/components/ui/icon-symbol";
import { COMPETITIONS } from "@/constants/competitions";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import React, {
    useEffect,
    useState,
} from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatPrice(p: number) {
  return p === 0
    ? "Free"
    : `Rp ${p.toLocaleString("id-ID")}`;
}

export default function CompetitionDetailPage() {
  const { id, from } =
    useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    registrations,
    registerCompetition,
  } = useUser();

  const comp = COMPETITIONS.find(
    (c) => c.id === id,
  );
  const [activeTab, setActiveTab] =
    useState<
      | "overview"
      | "registration"
      | "payment"
    >("overview");

  // Reset tab to overview when competition ID changes
  useEffect(() => {
    setActiveTab("overview");
  }, [id]);

  const handleBack = () => {
    // If came from Competitions tab, go back to Competitions
    if (from === "competitions") {
      router.push(
        "/(tabs)/competitions",
      );
    } else if (router.canGoBack()) {
      // Otherwise use standard back navigation
      router.back();
    } else {
      // Fallback to Competitions page
      router.push(
        "/(tabs)/competitions",
      );
    }
  };

  if (!comp) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
          >
            <IconSymbol
              size={24}
              name="chevron.left"
              color="#0F172A"
            />
          </Pressable>
          <Text
            style={styles.headerTitle}
          >
            Competition Not Found
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={styles.errorText}
          >
            This competition could not
            be loaded.
          </Text>
        </View>
      </View>
    );
  }

  const already = registrations.some(
    (r) => r.compId === comp.id,
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
        >
          <IconSymbol
            size={24}
            name="chevron.left"
            color="#0F172A"
          />
        </Pressable>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {comp.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Competition emoji and quick info */}
      <View style={styles.infoCard}>
        <Text style={styles.emoji}>
          {comp.image}
        </Text>
        <Text style={styles.compTitle}>
          {comp.title}
        </Text>
        <Text style={styles.compOrg}>
          {comp.organizer}
        </Text>
        <Text style={styles.compMeta}>
          {comp.category} ·{" "}
          {comp.grade.join(", ")} ·{" "}
          {comp.deadline}
        </Text>
        <Text
          style={[
            styles.compPrice,
            { marginTop: 12 },
          ]}
        >
          {formatPrice(comp.price)}
        </Text>
      </View>

      {/* Tab navigation */}
      <View style={styles.tabNav}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "overview" &&
              styles.tabActive,
          ]}
          onPress={() =>
            setActiveTab("overview")
          }
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab ===
                "overview" &&
                styles.tabLabelActive,
            ]}
          >
            Halaman Utama
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab ===
              "registration" &&
              styles.tabActive,
          ]}
          onPress={() =>
            setActiveTab("registration")
          }
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab ===
                "registration" &&
                styles.tabLabelActive,
            ]}
          >
            Pendaftaran
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "payment" &&
              styles.tabActive,
          ]}
          onPress={() =>
            setActiveTab("payment")
          }
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "payment" &&
                styles.tabLabelActive,
            ]}
          >
            Pembayaran
          </Text>
        </Pressable>
      </View>

      {/* Tab content */}
      <ScrollView
        contentContainerStyle={
          styles.tabContent
        }
      >
        {activeTab === "overview" && (
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              About
            </Text>
            <Text
              style={styles.sectionText}
            >
              {comp.description}
            </Text>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Dates
            </Text>
            <Text
              style={styles.sectionText}
            >
              Start: {comp.startDate}
            </Text>
            <Text
              style={styles.sectionText}
            >
              End: {comp.endDate}
            </Text>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Ages / Grades
            </Text>
            <Text
              style={styles.sectionText}
            >
              {comp.ages} ·{" "}
              {comp.grade.join(", ")}
            </Text>

            {comp.steps?.length ? (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Steps
                </Text>
                {comp.steps.map(
                  (
                    s: string,
                    i: number,
                  ) => (
                    <Text
                      key={i}
                      style={
                        styles.sectionText
                      }
                    >
                      • {s}
                    </Text>
                  ),
                )}
              </>
            ) : null}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Prize
            </Text>
            <Text
              style={styles.sectionText}
            >
              {comp.prize}
            </Text>
          </View>
        )}

        {activeTab ===
          "registration" && (
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Registration Information
            </Text>
            <View
              style={styles.infoBox}
            >
              <Text
                style={styles.boxLabel}
              >
                Registration Status
              </Text>
              <Text
                style={styles.boxValue}
              >
                {already
                  ? "✓ Registered"
                  : "Not Registered"}
              </Text>
            </View>

            <View
              style={styles.infoBox}
            >
              <Text
                style={styles.boxLabel}
              >
                Registration Deadline
              </Text>
              <Text
                style={styles.boxValue}
              >
                {comp.deadline}
              </Text>
            </View>

            <View
              style={styles.infoBox}
            >
              <Text
                style={styles.boxLabel}
              >
                Eligible Grades
              </Text>
              <Text
                style={styles.boxValue}
              >
                {comp.grade.join(", ")}
              </Text>
            </View>

            <View
              style={styles.infoBox}
            >
              <Text
                style={styles.boxLabel}
              >
                Age Range
              </Text>
              <Text
                style={styles.boxValue}
              >
                {comp.ages}
              </Text>
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { marginTop: 20 },
              ]}
            >
              Registration Steps
            </Text>
            {comp.steps?.map(
              (
                s: string,
                i: number,
              ) => (
                <View
                  key={i}
                  style={
                    styles.stepItem
                  }
                >
                  <View
                    style={
                      styles.stepNumber
                    }
                  >
                    <Text
                      style={
                        styles.stepNumberText
                      }
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <Text
                    style={
                      styles.stepText
                    }
                  >
                    {s}
                  </Text>
                </View>
              ),
            )}
          </View>
        )}

        {activeTab === "payment" && (
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Payment Information
            </Text>
            <View
              style={styles.infoBox}
            >
              <Text
                style={styles.boxLabel}
              >
                Registration Fee
              </Text>
              <Text
                style={[
                  styles.boxValue,
                  {
                    fontSize: 20,
                    fontWeight: "800",
                  },
                ]}
              >
                {formatPrice(
                  comp.price,
                )}
              </Text>
            </View>

            {comp.price > 0 ? (
              <>
                <Text
                  style={[
                    styles.sectionText,
                    { marginTop: 12 },
                  ]}
                >
                  Payment methods will
                  be provided after you
                  register. You can pay
                  via bank transfer or
                  online payment
                  gateway.
                </Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    { marginTop: 16 },
                  ]}
                >
                  Payment Status
                </Text>
                <View
                  style={styles.infoBox}
                >
                  <Text
                    style={
                      styles.boxLabel
                    }
                  >
                    Your Payment Status
                  </Text>
                  <Text
                    style={[
                      styles.boxValue,
                      {
                        color: already
                          ? "#EF4444"
                          : "#94A3B8",
                      },
                    ]}
                  >
                    {already
                      ? "Pending"
                      : "Not Registered Yet"}
                  </Text>
                </View>
              </>
            ) : (
              <Text
                style={[
                  styles.sectionText,
                  {
                    marginTop: 12,
                    color: "#059669",
                  },
                ]}
              >
                ✓ This competition is
                FREE! No payment
                required.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Register button at bottom */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          style={[
            styles.registerBtn,
            already &&
              styles.registerBtnDisabled,
          ]}
          onPress={() => {
            if (!already) {
              registerCompetition(
                comp.id,
              );
            }
            router.push(
              "/(tabs)/my-competitions",
            );
          }}
        >
          <Text
            style={
              styles.registerBtnText
            }
          >
            {already
              ? "✓ Registered"
              : "Register Now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginHorizontal: 8,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  emoji: {
    fontSize: 48,
  },
  compTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    textAlign: "center",
  },
  compOrg: {
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  compMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  compPrice: {
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  tabNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Brand.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textAlign: "center",
  },
  tabLabelActive: {
    color: Brand.primary,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    color: "#334155",
    lineHeight: 20,
    marginTop: 6,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  boxLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  boxValue: {
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 6,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    color: "#334155",
    lineHeight: 20,
    paddingTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  registerBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  registerBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  registerBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  errorText: {
    color: "#64748B",
    fontSize: 14,
  },
});
