import { AppInput } from "@/components/common/AppInput";
import { Brand } from "@/constants/theme";
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!phone.trim())
      e.phone =
        "Phone number is required";
    else if (
      phone.replace(/\D/g, "").length <
      9
    )
      e.phone =
        "Enter a valid phone number";
    if (!password)
      e.password =
        "Password is required";
    else if (password.length < 6)
      e.password =
        "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    // TODO: call auth API
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
            Welcome Back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to access your
            competitions, results, and
            certificates.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            label="Password"
            placeholder="Enter your password"
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

          <TouchableOpacity
            style={styles.forgotBtn}
            activeOpacity={0.7}
          >
            <Text
              style={styles.forgotText}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text
              style={
                styles.primaryBtnText
              }
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View
            style={styles.dividerLine}
          />
          <Text
            style={styles.dividerText}
          >
            or
          </Text>
          <View
            style={styles.dividerLine}
          />
        </View>

        {/* OTP option */}
        <TouchableOpacity
          style={styles.otpBtn}
          activeOpacity={0.8}
        >
          <Text
            style={styles.otpBtnText}
          >
            Sign in with OTP instead
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={styles.footerText}
          >
            Don&apos;t have an
            account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/(auth)/register" as any,
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
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
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
  eyeIcon: {
    fontSize: 18,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#94A3B8",
  },
  otpBtn: {
    borderWidth: 1.5,
    borderColor: Brand.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  otpBtnText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "600",
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
