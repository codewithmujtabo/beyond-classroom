import { AppInput } from "@/components/common/AppInput";
import { AppUser } from "@/constants/mock-user";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Role selector ────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "student",
    label: "Student",
    emoji: "🎒",
  },
  {
    id: "parent",
    label: "Parent",
    emoji: "👨‍👧",
  },
  {
    id: "teacher",
    label: "Teacher",
    emoji: "📖",
  },
] as const;

type Role =
  (typeof ROLES)[number]["id"];

// ─── Level selector (for students) ───────────────────────────────────────────
const LEVELS = [
  "SD",
  "SMP",
  "SMA",
] as const;
type Level = (typeof LEVELS)[number];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { setUser } = useUser();

  // Form state
  const [role, setRole] =
    useState<Role>("student");
  const [name, setName] = useState("");
  const [phone, setPhone] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [school, setSchool] =
    useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] =
    useState<Level>("SMP");
  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const validate = () => {
    const e: Record<string, string> =
      {};
    if (!name.trim())
      e.name = "Full name is required";
    if (!phone.trim())
      e.phone =
        "Phone number is required";
    else if (
      phone.replace(/\D/g, "").length <
      9
    )
      e.phone =
        "Enter a valid phone number";
    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    )
      e.email = "Enter a valid email";
    if (!school.trim())
      e.school =
        "School name is required";
    if (!city.trim())
      e.city = "City is required";
    if (!password)
      e.password =
        "Password is required";
    else if (password.length < 6)
      e.password =
        "Minimum 6 characters";
    if (confirmPassword !== password)
      e.confirmPassword =
        "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    // Build the user object from form data and put it in context
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role,
      school: school.trim(),
      city: city.trim(),
      // level only applies to students; default to "SMP" for others
      level:
        role === "student"
          ? level
          : "SMP",
    };
    setUser(newUser);

    router.replace("/(tabs)" as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom:
              insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text
              style={styles.logoEmoji}
            >
              🏆
            </Text>
          </View>
          <Text style={styles.title}>
            Create Account
          </Text>
          <Text style={styles.subtitle}>
            Join thousands of students,
            parents, and teachers in
            Indonesia&apos;s biggest
            competition platform.
          </Text>
        </View>

        {/* Role selector */}
        <View style={styles.section}>
          <Text
            style={styles.sectionLabel}
          >
            I am a
          </Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roleCard,
                  role === r.id &&
                    styles.roleCardActive,
                ]}
                onPress={() =>
                  setRole(r.id)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.roleEmoji
                  }
                >
                  {r.emoji}
                </Text>
                <Text
                  style={[
                    styles.roleLabel,
                    role === r.id &&
                      styles.roleLabelActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppInput
            label="Full Name"
            placeholder="e.g. Budi Santoso"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
          />
          <AppInput
            label="Phone Number"
            placeholder="e.g. 08123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
            maxLength={15}
          />
          <AppInput
            label="Email (optional)"
            placeholder="e.g. budi@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <AppInput
            label="School Name"
            placeholder="e.g. SMP Negeri 1 Jakarta"
            value={school}
            onChangeText={setSchool}
            error={errors.school}
            autoCapitalize="words"
          />
          <AppInput
            label="City"
            placeholder="e.g. Jakarta"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            autoCapitalize="words"
          />

          {/* Level — only shown for students */}
          {role === "student" && (
            <View
              style={
                styles.levelWrapper
              }
            >
              <Text
                style={
                  styles.levelLabel
                }
              >
                Grade Level
              </Text>
              <View
                style={styles.levelRow}
              >
                {LEVELS.map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.levelBtn,
                      level === l &&
                        styles.levelBtnActive,
                    ]}
                    onPress={() =>
                      setLevel(l)
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.levelBtnText,
                        level === l &&
                          styles.levelBtnTextActive,
                      ]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <AppInput
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={
              !showPassword
            }
            error={errors.password}
            rightIcon={
              <Text
                style={styles.eyeIcon}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </Text>
            }
            onRightIconPress={() =>
              setShowPassword((v) => !v)
            }
          />
          <AppInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry={
              !showPassword
            }
            error={
              errors.confirmPassword
            }
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text
              style={
                styles.primaryBtnText
              }
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={styles.footerText}
          >
            Already have an
            account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.footerLink}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    gap: 6,
  },
  roleCardActive: {
    borderColor: Brand.primary,
    backgroundColor: "#EEF2FF",
  },
  roleEmoji: {
    fontSize: 22,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  roleLabelActive: {
    color: Brand.primary,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  levelWrapper: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  levelBtnActive: {
    borderColor: Brand.primary,
    backgroundColor: "#EEF2FF",
  },
  levelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  levelBtnTextActive: {
    color: Brand.primary,
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 14,
    color: Brand.primary,
    fontWeight: "700",
  },
});
