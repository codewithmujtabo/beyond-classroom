import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/constants/theme";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Maintenance Window",
    date: "Apr 2, 2026",
    category: "system",
    icon: "🔧",
    preview:
      "We'll be performing a short maintenance between 02:00-03:00 UTC. Some features may be temporarily unavailable.",
    fullText:
      "We'll be performing a short maintenance between 02:00-03:00 UTC. Some features may be temporarily unavailable. During this time, you won't be able to access the platform or register for competitions. We apologize for any inconvenience this may cause.",
  },
  {
    id: "a2",
    title:
      "New Competition Added: City Math Cup",
    date: "Mar 29, 2026",
    category: "competition",
    icon: "🏆",
    preview:
      "Registration opens today for City Math Cup. Open for SD & SMP categories. Register early to secure your slot!",
    fullText:
      "Registration opens today for City Math Cup! This is an exciting opportunity for students in SD & SMP categories to showcase their mathematical skills. The competition focuses on problem-solving and mathematical reasoning. Limited slots are available, so register early to secure your spot. The competition will be held online with multiple rounds. Winners will receive certificates and prizes.",
  },
  {
    id: "a3",
    title:
      "Tips: How to prepare for online competitions",
    date: "Mar 27, 2026",
    category: "tips",
    icon: "💡",
    preview:
      "Check the competition rules, run a device test, and prepare backup documents. Read the full guide in Resources.",
    fullText:
      "Preparing for online competitions requires proper planning and technical preparation. Here are key tips: 1) Read competition rules thoroughly at least one week before. 2) Test your device, internet connection, and browser compatibility. 3) Prepare backup documents and have them ready. 4) Create a quiet study environment. 5) Have a backup internet connection ready (mobile hotspot). 6) Test your camera and microphone if needed. 7) Clear your browser cache. 8) Have water and snacks nearby. For the full detailed guide, please visit Resources.",
  },
  {
    id: "a4",
    title:
      "Platform Update v2.1 Released",
    date: "Mar 25, 2026",
    category: "update",
    icon: "⚡",
    preview:
      "New features added: improved search, better filtering, and performance enhancements.",
    fullText:
      "We're excited to announce the release of platform v2.1! This update includes several improvements: Enhanced search functionality with auto-suggestions, Better competition filtering with advanced options, 30% faster page load times, Improved mobile responsiveness, Bug fixes and security patches. Thank you for using our platform! Your feedback helps us improve.",
  },
];

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const [
    selectedAnnouncement,
    setSelectedAnnouncement,
  ] = useState<
    (typeof ANNOUNCEMENTS)[0] | null
  >(null);
  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const openDetail = (
    item: (typeof ANNOUNCEMENTS)[0],
  ) => {
    setSelectedAnnouncement(item);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setSelectedAnnouncement(null);
  };

  const getCategoryColor = (
    category: string,
  ) => {
    switch (category) {
      case "system":
        return "#F59E0B";
      case "competition":
        return "#10B981";
      case "tips":
        return "#3B82F6";
      case "update":
        return "#8B5CF6";
      default:
        return Brand.primary;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          📰 News & Announcements
        </Text>
        <Text style={styles.subtitle}>
          Stay updated with latest news
          and competitions
        </Text>
      </View>

      <FlatList
        data={ANNOUNCEMENTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              openDetail(item)
            }
          >
            <View
              style={styles.cardTop}
            >
              <View
                style={[
                  styles.iconBg,
                  {
                    backgroundColor:
                      getCategoryColor(
                        item.category,
                      ) + "20",
                  },
                ]}
              >
                <Text
                  style={
                    styles.categoryIcon
                  }
                >
                  {item.icon}
                </Text>
              </View>
              <View
                style={styles.cardInfo}
              >
                <View
                  style={
                    styles.categoryBadge
                  }
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      {
                        color:
                          getCategoryColor(
                            item.category,
                          ),
                      },
                    ]}
                  >
                    {item.category
                      .charAt(0)
                      .toUpperCase() +
                      item.category.slice(
                        1,
                      )}
                  </Text>
                </View>
                <Text
                  style={
                    styles.cardDate
                  }
                >
                  {item.date}
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
              style={styles.cardBody}
              numberOfLines={2}
            >
              {item.preview}
            </Text>
            <Pressable
              style={styles.viewMoreBtn}
              onPress={() =>
                openDetail(item)
              }
            >
              <Text
                style={
                  styles.viewMoreText
                }
              >
                View More
              </Text>
              <IconSymbol
                size={16}
                name="chevron.right"
                color={Brand.primary}
              />
            </Pressable>
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 12 }}
          />
        )}
      />

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeDetail}
        transparent
      >
        <View
          style={modalStyles.backdrop}
        >
          <View
            style={[
              modalStyles.sheet,
              {
                paddingTop: insets.top,
              },
            ]}
          >
            <View
              style={modalStyles.header}
            >
              <Pressable
                style={
                  modalStyles.closeBtn
                }
                onPress={closeDetail}
              >
                <IconSymbol
                  size={24}
                  name="chevron.left"
                  color="#0F172A"
                />
              </Pressable>
              <Text
                style={
                  modalStyles.headerTitle
                }
                numberOfLines={2}
              >
                {
                  selectedAnnouncement?.title
                }
              </Text>
              <View
                style={{ width: 24 }}
              />
            </View>

            <ScrollView
              contentContainerStyle={
                modalStyles.content
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={[
                  modalStyles.iconBox,
                  {
                    backgroundColor:
                      getCategoryColor(
                        selectedAnnouncement?.category ||
                          "system",
                      ) + "20",
                  },
                ]}
              >
                <Text
                  style={
                    modalStyles.largeIcon
                  }
                >
                  {
                    selectedAnnouncement?.icon
                  }
                </Text>
              </View>

              <View
                style={
                  modalStyles.metaRow
                }
              >
                <View
                  style={[
                    modalStyles.metaBadge,
                    {
                      backgroundColor:
                        getCategoryColor(
                          selectedAnnouncement?.category ||
                            "system",
                        ) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      modalStyles.metaBadgeText,
                      {
                        color:
                          getCategoryColor(
                            selectedAnnouncement?.category ||
                              "system",
                          ),
                      },
                    ]}
                  >
                    {selectedAnnouncement?.category
                      ? selectedAnnouncement.category
                          .charAt(0)
                          .toUpperCase() +
                        selectedAnnouncement.category.slice(
                          1,
                        )
                      : ""}
                  </Text>
                </View>
                <Text
                  style={
                    modalStyles.metaDate
                  }
                >
                  {
                    selectedAnnouncement?.date
                  }
                </Text>
              </View>

              <Text
                style={
                  modalStyles.fullTitle
                }
              >
                {
                  selectedAnnouncement?.title
                }
              </Text>

              <View
                style={
                  modalStyles.divider
                }
              />

              <Text
                style={
                  modalStyles.fullBody
                }
              >
                {
                  selectedAnnouncement?.fullText
                }
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDate: {
    color: "#94A3B8",
    fontSize: 12,
  },
  cardBody: {
    color: "#334155",
    marginTop: 4,
    lineHeight: 18,
    fontSize: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardTitle: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 14,
  },
  viewMoreBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  viewMoreText: {
    color: Brand.primary,
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  largeIcon: {
    fontSize: 48,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  metaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  fullTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  fullBody: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
  },
});
