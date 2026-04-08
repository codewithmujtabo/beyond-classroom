import { AppInput } from "@/components/common/AppInput";
import * as authService from "@/services/auth.service";
import { Brand } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

// ─── Grade selector (for students) ───────────────────────────────────────────
const GRADES = [
  "SD",
  "SMP",
  "SMA",
] as const;
type Grade = (typeof GRADES)[number];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Form state
  const [step, setStep] = useState<
    | "role"
    | "contact"
    | "details"
    | "confirm"
  >("role");
  const [role, setRole] =
    useState<Role>("student");
  const [email, setEmail] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [name, setName] = useState("");
  const [school, setSchool] =
    useState("");
  const [grade, setGrade] =
    useState<Grade>("SMP");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] =
    useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────

  const validateEmail = () => {
    const e: Record<string, string> =
      {};
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      e.email =
        "Please enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePhone = () => {
    const e: Record<string, string> =
      {};
    if (!phone.trim()) {
      e.phone = "Phone is required";
    } else if (
      phone.replace(/\D/g, "").length <
      9
    ) {
      e.phone =
        "Enter a valid phone number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e: Record<string, string> =
      {};
    if (!password.trim()) {
      e.password =
        "Password is required";
    } else if (password.length < 6) {
      e.password =
        "Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateDetails = () => {
    const e: Record<string, string> =
      {};
    if (!name.trim())
      e.name = "Full name is required";
    if (!school.trim())
      e.school =
        "School name is required";
    if (!city.trim())
      e.city = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Send OTP
  // ─────────────────────────────────────────────────────────────────────────

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await authService.sendOtp(email.trim());

      setStep("otp");
      Alert.alert(
        "Success",
        "OTP sent to your email. Check your inbox.",
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message || "Failed to send OTP. Try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Verify OTP
  // ─────────────────────────────────────────────────────────────────────────

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    setLoading(true);
    try {
      await authService.verifyOtp(email.trim(), otp);
      setStep("details");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message || "Invalid OTP. Try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Complete Registration
  // ─────────────────────────────────────────────────────────────────────────

  const handleCompleteRegistration =
    async () => {
      if (!validateDetails()) return;

      setLoading(true);
      try {
        // The user was already authenticated via OTP verification.
        // Now update their profile via the backend.
        const { updateProfile } = await import("@/services/user.service");
        await updateProfile({
          fullName: name.trim(),
          city: city.trim(),
          school: school.trim(),
          grade: role === "student" ? grade : undefined,
        });

        Alert.alert(
          "Success",
          "Account created! Welcome to Beyond Classroom",
        );
        router.replace("/(tabs)");
      } catch (err: any) {
        console.error("Registration error:", err);
        Alert.alert(
          "Error",
          err?.message || "Failed to save profile. Try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Step 1 - Role Selection
  // ─────────────────────────────────────────────────────────────────────────

  if (step === "role") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingTop:
                insets.top + 20,
              paddingBottom:
                insets.bottom + 24,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={styles.logoBox}
            >
              <Text
                style={styles.logoEmoji}
              >
                🏆
              </Text>
            </View>
            <Text style={styles.title}>
              Create Account
            </Text>
            <Text
              style={styles.subtitle}
            >
              Join thousands of
              students, parents, and
              teachers in Indonesia's
              biggest competition
              platform.
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={
                styles.sectionLabel
              }
            >
              I am a
            </Text>
            <View
              style={styles.roleRow}
            >
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

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              setStep("email")
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Continue
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text
              style={styles.footerText}
            >
              Already have an
              account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/(auth)/login",
                )
              }
            >
              <Text
                style={
                  styles.footerLink
                }
              >
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Step 2 - Email Address
  // ─────────────────────────────────────────────────────────────────────────

  if (step === "email") {
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
              paddingTop:
                insets.top + 20,
              paddingBottom:
                insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Enter Email Address
            </Text>
            <Text
              style={styles.subtitle}
            >
              We'll send you an OTP to
              verify your identity.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Email"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading &&
                styles.primaryButtonDisabled,
            ]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Send OTP
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setStep("role")
            }
          >
            <Text
              style={styles.backText}
            >
              ← Back
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Step 3 - OTP Verification
  // ─────────────────────────────────────────────────────────────────────────

  if (step === "otp") {
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
              paddingTop:
                insets.top + 20,
              paddingBottom:
                insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Verify OTP
            </Text>
            <Text
              style={styles.subtitle}
            >
              We sent a 6-digit code to{" "}
              {email}
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="OTP Code"
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              error={errors.otp}
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading &&
                styles.primaryButtonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Verify
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setStep("email")
            }
          >
            <Text
              style={styles.backText}
            >
              ← Change email address
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Step 4 - Complete Details
  // ─────────────────────────────────────────────────────────────────────────

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
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Complete Your Profile
          </Text>
          <Text style={styles.subtitle}>
            Just a few more details to
            get started.
          </Text>
        </View>

        <View
          style={[
            styles.form,
            { gap: 20 },
          ]}
        >
          <AppInput
            label="Full Name"
            placeholder="e.g. Budi Santoso"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
            editable={true}
            selectTextOnFocus={false}
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

          {/* Grade — only shown for students */}
          {role === "student" && (
            <View
              style={
                styles.gradeWrapper
              }
            >
              <Text
                style={
                  styles.gradeLabel
                }
              >
                Grade Level
              </Text>
              <View
                style={styles.gradeRow}
              >
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.gradeBtn,
                      grade === g &&
                        styles.gradeBtnActive,
                    ]}
                    onPress={() =>
                      setGrade(g)
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.gradeBtnText,
                        grade === g &&
                          styles.gradeBtnTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading &&
              styles.primaryButtonDisabled,
          ]}
          onPress={
            handleCompleteRegistration
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStep("otp")}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor:
      Brand.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
    gap: 8,
  },
  roleCardActive: {
    borderColor: Brand.primary,
    backgroundColor:
      Brand.primary + "10",
  },
  roleEmoji: {
    fontSize: 32,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  roleLabelActive: {
    color: Brand.primary,
  },
  form: {
    marginBottom: 32,
    gap: 20,
  },
  gradeWrapper: {
    marginTop: 24,
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: "row",
    gap: 12,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  gradeBtnActive: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primary,
  },
  gradeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  gradeBtnTextActive: {
    color: "white",
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  backText: {
    fontSize: 14,
    color: Brand.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
  },
  footerLink: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "600",
  },
});
