import { Brand } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export function LoginScreen() {
  const { login, isLoading, error } =
    useAuth();
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      newErrors.email =
        "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password =
        "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      Alert.alert(
        "Success",
        "Logged in successfully!",
      );
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err?.message ||
          "Failed to login",
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome Back 👋
        </Text>
        <Text style={styles.subtitle}>
          Login to your account to
          continue
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text
            style={styles.errorText}
          >
            {error}
          </Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.email &&
              styles.inputError,
          ]}
          placeholder="your@email.com"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {errors.email && (
          <Text
            style={styles.errorText}
          >
            {errors.email}
          </Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Password
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.password &&
              styles.inputError,
          ]}
          placeholder="At least 6 characters"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {errors.password && (
          <Text
            style={styles.errorText}
          >
            {errors.password}
          </Text>
        )}
      </View>

      <Pressable
        style={[
          styles.button,
          isLoading &&
            styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#fff"
          />
        ) : (
          <Text
            style={styles.buttonText}
          >
            Login
          </Text>
        )}
      </Pressable>

      <Text style={styles.helpText}>
        Don't have an account? Create
        one in the Sign Up screen
      </Text>
    </ScrollView>
  );
}

export function SignupScreen() {
  const { signup, isLoading, error } =
    useAuth();
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [fullName, setFullName] =
    useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      newErrors.email =
        "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password =
        "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup(
        email,
        password,
        fullName,
      );
      Alert.alert(
        "Success",
        "Account created successfully!",
      );
      // Form will be cleared by auth context update
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err: any) {
      Alert.alert(
        "Signup Failed",
        err?.message ||
          "Failed to signup",
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Create Account 🎓
        </Text>
        <Text style={styles.subtitle}>
          Join Beyond Classroom today
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text
            style={styles.errorText}
          >
            {error}
          </Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Full Name
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.fullName &&
              styles.inputError,
          ]}
          placeholder="John Doe"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
          editable={!isLoading}
        />
        {errors.fullName && (
          <Text
            style={styles.errorText}
          >
            {errors.fullName}
          </Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.email &&
              styles.inputError,
          ]}
          placeholder="your@email.com"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {errors.email && (
          <Text
            style={styles.errorText}
          >
            {errors.email}
          </Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Password
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.password &&
              styles.inputError,
          ]}
          placeholder="At least 6 characters"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {errors.password && (
          <Text
            style={styles.errorText}
          >
            {errors.password}
          </Text>
        )}
      </View>

      <Pressable
        style={[
          styles.button,
          isLoading &&
            styles.buttonDisabled,
        ]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#fff"
          />
        ) : (
          <Text
            style={styles.buttonText}
          >
            Sign Up
          </Text>
        )}
      </Pressable>

      <Text style={styles.helpText}>
        Already have an account? Login
        in the Login screen
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  helpText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 16,
    textAlign: "center",
  },
});
