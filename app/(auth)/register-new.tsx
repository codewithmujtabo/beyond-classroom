import { AppInput } from "@/components/common/AppInput";
import * as authService from "@/services/auth.service";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
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

const GRADES = [
  "SD",
  "SMP",
  "SMA",
] as const;
type Grade = (typeof GRADES)[number];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fetchUser } = useUser();

  // Step 1: Role selection, Step 2: Details
  const [step, setStep] = useState<
    "role" | "details"
  >("role");
  const [role, setRole] =
    useState<Role>("student");

  // Common fields
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] =
    useState("");
  const [city, setCity] = useState("");

  // Student specific
  const [school, setSchool] =
    useState("");
  const [grade, setGrade] =
    useState<Grade>("SMP");

  // Parent specific
  const [childName, setChildName] =
    useState("");
  const [childSchool, setChildSchool] =
    useState("");
  const [childGrade, setChildGrade] =
    useState<Grade>("SMP");

  // Teacher specific
  const [
    teacherSchool,
    setTeacherSchool,
  ] = useState("");
  const [subject, setSubject] =
    useState("");

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] =
    useState(false);

  // ─── Validation ────────────────────────────────────────────────────────────

  const validateDetails = () => {
    const e: Record<string, string> =
      {};

    // Common validations
    if (!name.trim())
      e.name = "Full name is required";
    else if (name.trim().length < 3)
      e.name =
        "Name must be at least 3 characters";

    if (!email.trim())
      e.email = "Email is required";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    )
      e.email = "Enter a valid email";

    if (!password)
      e.password =
        "Password is required";
    else if (password.length < 6)
      e.password =
        "Password must be at least 6 characters";

    if (!phone.trim())
      e.phone =
        "Phone number is required";
    else if (
      phone.replace(/\D/g, "").length <
      9
    )
      e.phone =
        "Enter a valid phone number";

    if (!city.trim())
      e.city = "City is required";

    // Role-specific validations
    if (role === "student") {
      if (!school.trim())
        e.school =
          "School name is required";
      if (!grade)
        e.grade =
          "Grade level is required";
    } else if (role === "parent") {
      if (!childName.trim())
        e.childName =
          "Child's name is required";
      if (!childSchool.trim())
        e.childSchool =
          "Child's school is required";
      if (!childGrade)
        e.childGrade =
          "Child's grade is required";
    } else if (role === "teacher") {
      if (!teacherSchool.trim())
        e.teacherSchool =
          "School name is required";
      if (!subject.trim())
        e.subject =
          "Subject is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Registration Handler ───────────────────────────────────────────────────

  const handleCreateAccount =
    async () => {
      if (!validateDetails()) return;

      setLoading(true);
      try {
        let roleData: any = {};
        if (role === "student") {
          roleData = { school: school.trim(), grade };
        } else if (role === "parent") {
          roleData = { childName: childName.trim(), childSchool: childSchool.trim(), childGrade };
        } else if (role === "teacher") {
          roleData = { school: teacherSchool.trim(), subject: subject.trim() };
        }

        const { user } =
          await authService.signup({
            email: email.trim(),
            password: password.trim(),
            fullName: name.trim(),
            phone: phone.trim(),
            city: city.trim(),
            role,
            roleData,
          });

        Alert.alert(
          "Success",
          "Account created! Welcome to Beyond Classroom",
        );

        if (user?.id) {
          await fetchUser(user.id);
        }

        router.replace("/(tabs)");
      } catch (err: any) {
        console.error("Registration error:", err);
        const msg = err?.message?.toLowerCase() || "";
        if (msg.includes("already")) {
          Alert.alert("Account Exists", "This email is already registered. Please login instead.");
        } else {
          Alert.alert("Error", err?.message || "Registration failed");
        }
      } finally {
        setLoading(false);
      }
    };

  // ─── Step 1: Role Selection ─────────────────────────────────────────────────

  if (step === "role") {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.roleHeader}
          >
            <Text
              style={styles.roleTitle}
            >
              Choose Your Role
            </Text>
            <Text
              style={
                styles.roleSubtitle
              }
            >
              Select how you'll use
              Beyond Classroom
            </Text>
          </View>

          <View
            style={
              styles.rolesContainer
            }
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
                activeOpacity={0.7}
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

          <View
            style={
              styles.roleDescription
            }
          >
            {role === "student" && (
              <Text
                style={
                  styles.descriptionText
                }
              >
                Discover and register
                for competitions
                tailored to your
                academic level.
              </Text>
            )}
            {role === "parent" && (
              <Text
                style={
                  styles.descriptionText
                }
              >
                Help your child find and
                participate in
                competitions.
              </Text>
            )}
            {role === "teacher" && (
              <Text
                style={
                  styles.descriptionText
                }
              >
                Encourage your students
                to participate in
                academic competitions.
              </Text>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() =>
            setStep("details")
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.continueBtnText
            }
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Step 2: Details Collection ─────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              setStep("role")
            }
            style={styles.backBtn}
          >
            <Text
              style={styles.backBtnText}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text
            style={styles.stepTitle}
          >
            Complete Your Profile
          </Text>
        </View>

        {/* Common Fields */}
        <View style={styles.section}>
          <Text
            style={styles.sectionLabel}
          >
            Basic Information
          </Text>

          <AppInput
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <AppInput
            label="Email"
            placeholder="e.g. john@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />

          <AppInput
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <AppInput
            label="Phone Number"
            placeholder="e.g. 08123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <AppInput
            label="City"
            placeholder="e.g. Jakarta"
            value={city}
            onChangeText={setCity}
            error={errors.city}
          />
        </View>

        {/* Student-specific fields */}
        {role === "student" && (
          <View style={styles.section}>
            <Text
              style={
                styles.sectionLabel
              }
            >
              Student Information
            </Text>

            <AppInput
              label="School Name"
              placeholder="e.g. SMP Negeri 1 Jakarta"
              value={school}
              onChangeText={setSchool}
              error={errors.school}
            />

            <View
              style={styles.formGroup}
            >
              <Text
                style={styles.label}
              >
                Grade Level
              </Text>
              <View
                style={
                  styles.gradeButtons
                }
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
              {errors.grade && (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.grade}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Parent-specific fields */}
        {role === "parent" && (
          <View style={styles.section}>
            <Text
              style={
                styles.sectionLabel
              }
            >
              Child Information
            </Text>

            <AppInput
              label="Child's Full Name"
              placeholder="e.g. Jane Doe"
              value={childName}
              onChangeText={
                setChildName
              }
              error={errors.childName}
            />

            <AppInput
              label="Child's School"
              placeholder="e.g. SMP Negeri 1 Jakarta"
              value={childSchool}
              onChangeText={
                setChildSchool
              }
              error={errors.childSchool}
            />

            <View
              style={styles.formGroup}
            >
              <Text
                style={styles.label}
              >
                Child's Grade
              </Text>
              <View
                style={
                  styles.gradeButtons
                }
              >
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.gradeBtn,
                      childGrade ===
                        g &&
                        styles.gradeBtnActive,
                    ]}
                    onPress={() =>
                      setChildGrade(g)
                    }
                  >
                    <Text
                      style={[
                        styles.gradeBtnText,
                        childGrade ===
                          g &&
                          styles.gradeBtnTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.childGrade && (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.childGrade}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Teacher-specific fields */}
        {role === "teacher" && (
          <View style={styles.section}>
            <Text
              style={
                styles.sectionLabel
              }
            >
              Teaching Information
            </Text>

            <AppInput
              label="School Name"
              placeholder="e.g. SMP Negeri 1 Jakarta"
              value={teacherSchool}
              onChangeText={
                setTeacherSchool
              }
              error={
                errors.teacherSchool
              }
            />

            <AppInput
              label="Subject"
              placeholder="e.g. Mathematics"
              value={subject}
              onChangeText={setSubject}
              error={errors.subject}
            />
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footerButtons,
          {
            paddingBottom:
              insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            setStep("role")
          }
          disabled={loading}
        >
          <Text
            style={styles.backBtnText}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.registerBtn,
            loading &&
              styles.registerBtnDisabled,
          ]}
          onPress={handleCreateAccount}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              color="#fff"
              size="small"
            />
          ) : (
            <Text
              style={
                styles.registerBtnText
              }
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  // ─── Role Selection Screen ─────────────────────────────────────────────────
  roleHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  roleTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  rolesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  roleCardActive: {
    borderColor: Brand.primary,
    backgroundColor: "#EEF2FF",
  },
  roleEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  roleLabelActive: {
    color: Brand.primary,
  },
  roleDescription: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  continueBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // ─── Details Screen ───────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
  },
  gradeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  gradeBtnActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  gradeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  gradeBtnTextActive: {
    color: "#fff",
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
