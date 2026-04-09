import { Brand } from "@/constants/theme";
import { useUser } from "@/context/AuthContext";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const roleLabel = {
    student: "Student",
    parent: "Parent",
    teacher: "Teacher",
  }[user?.role ?? "student"];

  const menuItems = [
    {
      emoji: "👤",
      label: "Complete Profile",
      onPress: () =>
        router.push(
          "/(tabs)/profile/setup",
        ),
    },
    {
      emoji: "📄",
      label: "Document Vault",
      onPress: () =>
        router.push(
          "/(tabs)/profile/document-vault",
        ),
    },
    {
      emoji: "🔔",
      label: "Notifications",
      onPress: () => {},
    },
    {
      emoji: "⚙️",
      label: "Account Settings",
      onPress: () => {},
    },
    {
      emoji: "❓",
      label: "Help & FAQ",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* Avatar card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text
            style={styles.avatarInitial}
          >
            {user?.name
              ?.charAt(0)
              .toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.name ?? "—"}
        </Text>
        <View style={styles.roleBadge}>
          <Text
            style={styles.roleBadgeText}
          >
            {roleLabel}
          </Text>
        </View>
        <Text style={styles.meta}>
          {user?.school} · {user?.city}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          {
            label: "Competitions",
            value: "0",
          },
          {
            label: "Certificates",
            value: "0",
          },
          {
            label: "Points",
            value: "0",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={styles.statItem}
          >
            <Text
              style={styles.statValue}
            >
              {s.value}
            </Text>
            <Text
              style={styles.statLabel}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              i <
                menuItems.length - 1 &&
                styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text
              style={styles.menuEmoji}
            >
              {item.emoji}
            </Text>
            <Text
              style={styles.menuLabel}
            >
              {item.label}
            </Text>
            <Text
              style={styles.menuChevron}
            >
              ›
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={() =>
          router.replace(
            "/(auth)/login" as any,
          )
        }
        activeOpacity={0.8}
      >
        <Text
          style={styles.signOutText}
        >
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  avatarCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.primary,
  },
  meta: {
    fontSize: 13,
    color: "#94A3B8",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Brand.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuEmoji: {
    fontSize: 20,
    width: 28,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  menuChevron: {
    fontSize: 22,
    color: "#CBD5E1",
    fontWeight: "300",
  },
  signOutBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
});
