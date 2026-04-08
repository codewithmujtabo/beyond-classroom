import { AppInput } from "@/components/common/AppInput";
import { supabase } from "@/config/supabase";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { fetchUser } = useUser();
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [otp, setOtp] = useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [loading, setLoading] =
    useState(false);
  const [loginMode, setLoginMode] =
    useState<"password" | "otp">(
      "password",
    );
  const [otpSent, setOtpSent] =
    useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    otp?: string;
  }>({});

  const validateForm = () => {
    const e: typeof errors = {};
    if (!email.trim())
      e.email = "Email is required";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    )
      e.email = "Enter a valid email";
    if (loginMode === "password") {
      if (!password)
        e.password =
          "Password is required";
      else if (password.length < 6)
        e.password =
          "Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateEmail = () => {
    const e: typeof errors = {};
    if (!email.trim())
      e.email = "Email is required";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    )
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOtp = () => {
    const e: typeof errors = {};
    if (!otp.trim())
      e.otp = "OTP is required";
    else if (otp.length < 6)
      e.otp =
        "OTP must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error } =
        await supabase.auth.signInWithOtp(
          {
            email: email.trim(),
          },
        );

      if (error) {
        Alert.alert(
          "Error",
          error.message,
        );
        return;
      }

      setOtpSent(true);
      Alert.alert(
        "Success",
        "OTP sent to your email. Check your inbox.",
      );
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to send OTP. Try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    setLoading(true);
    try {
      const { error } =
        await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp,
          type: "email",
        });

      if (error) {
        Alert.alert(
          "Error",
          error.message,
        );
        return;
      }

      Alert.alert(
        "Success",
        "Logged in!",
      );
      // Wait for auth session to fully establish
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      );
      // Fetch user from database
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await fetchUser(user.id);
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Invalid OTP. Try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Sign in with email and password
      const { data, error } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password: password.trim(),
          },
        );

      if (error) {
        if (
          error.message
            .toLowerCase()
            .includes("invalid")
        ) {
          Alert.alert(
            "Error",
            "There is no user with this email or password is incorrect",
          );
        } else {
          Alert.alert(
            "Error",
            error.message,
          );
        }
        return;
      }

      if (data.user) {
        Alert.alert(
          "Success",
          "Logged in!",
        );
        // Wait for auth session to fully establish
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );
        // Fetch user from database
        await fetchUser(data.user.id);
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error(
        "Login error:",
        err,
      );
      Alert.alert(
        "Error",
        "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text
              style={styles.logoEmoji}
            >
              🏆
            </Text>
          </View>
          <Text style={styles.title}>
            Welcome Back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to access your
            competitions, results, and
            certificates.
          </Text>
        </View>

        {/* Login Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              loginMode ===
                "password" &&
                styles.modeButtonActive,
            ]}
            onPress={() => {
              setLoginMode("password");
              setOtpSent(false);
              setOtp("");
              setErrors({});
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                loginMode ===
                  "password" &&
                  styles.modeButtonTextActive,
              ]}
            >
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              loginMode === "otp" &&
                styles.modeButtonActive,
            ]}
            onPress={() => {
              setLoginMode("otp");
              setPassword("");
              setOtpSent(false);
              setOtp("");
              setErrors({});
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                loginMode === "otp" &&
                  styles.modeButtonTextActive,
              ]}
            >
              OTP
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.form,
            { gap: 16 },
          ]}
        >
          <AppInput
            label="Email"
            placeholder="e.g. john@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            editable={!loading}
          />

          {loginMode === "password" ? (
            <>
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={
                  setPassword
                }
                secureTextEntry={
                  !showPassword
                }
                error={errors.password}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }
              >
                <Text
                  style={
                    styles.showPassword
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}{" "}
                  password
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {otpSent && (
                <AppInput
                  label="OTP Code"
                  placeholder="Enter OTP from your email"
                  value={otp}
                  onChangeText={setOtp}
                  error={errors.otp}
                  editable={!loading}
                  maxLength={6}
                  keyboardType="number-pad"
                />
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading &&
              styles.primaryButtonDisabled,
          ]}
          onPress={
            loginMode === "password"
              ? handleLogin
              : otpSent
                ? handleVerifyOtp
                : handleSendOtp
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="white"
              size="small"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {loginMode === "password"
                ? "Sign In"
                : otpSent
                  ? "Verify OTP"
                  : "Send OTP"}
            </Text>
          )}
        </TouchableOpacity>

        {otpSent && (
          <TouchableOpacity
            onPress={() => {
              setOtpSent(false);
              setOtp("");
              setErrors({});
            }}
          >
            <Text
              style={
                styles.showPassword
              }
            >
              Back
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text
            style={styles.footerText}
          >
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/(auth)/register",
              )
            }
          >
            <Text
              style={styles.footerLink}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
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
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  showPassword: {
    color: Brand.primary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "700",
  },
  modeToggle: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
});
