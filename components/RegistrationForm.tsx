import { Brand } from "@/constants/theme";
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

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  grade: string;
  school: string;
  parentName?: string;
  parentPhone?: string;
}

interface RegistrationFormProps {
  competitionId: string;
  competitionTitle: string;
  onSubmit: (
    data: RegistrationFormData,
  ) => Promise<void>;
  isLoading?: boolean;
}

export const RegistrationForm: React.FC<
  RegistrationFormProps
> = ({
  competitionId,
  competitionTitle,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] =
    useState<RegistrationFormData>({
      fullName: "",
      email: "",
      phone: "",
      grade: "",
      school: "",
      parentName: "",
      parentPhone: "",
    });

  const [errors, setErrors] = useState<
    Partial<RegistrationFormData>
  >({});
  const [submitted, setSubmitted] =
    useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> =
      {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email,
      )
    ) {
      newErrors.email =
        "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^\d{10,}$/.test(
        formData.phone.replace(
          /\D/g,
          "",
        ),
      )
    ) {
      newErrors.phone =
        "Phone must be at least 10 digits";
    }

    if (!formData.grade.trim()) {
      newErrors.grade =
        "Grade is required";
    }

    if (!formData.school.trim()) {
      newErrors.school =
        "School name is required";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly.",
      );
      return;
    }

    try {
      setSubmitted(true);
      await onSubmit(formData);
      Alert.alert(
        "Success",
        `You have successfully registered for ${competitionTitle}!`,
      );
      // Reset form after successful submission
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        grade: "",
        school: "",
        parentName: "",
        parentPhone: "",
      });
    } catch (error) {
      Alert.alert(
        "Registration Error",
        "Failed to register. Please try again.",
      );
    } finally {
      setSubmitted(false);
    }
  };

  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Register for{" "}
          {competitionTitle}
        </Text>
        <Text style={styles.subtitle}>
          Please fill in your details
          below
        </Text>
      </View>

      {/* Full Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Full Name{" "}
          <Text style={styles.required}>
            *
          </Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.fullName &&
              styles.inputError,
          ]}
          placeholder="Enter your full name"
          placeholderTextColor="#94A3B8"
          value={formData.fullName}
          onChangeText={(text) =>
            handleInputChange(
              "fullName",
              text,
            )
          }
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

      {/* Email */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Email{" "}
          <Text style={styles.required}>
            *
          </Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.email &&
              styles.inputError,
          ]}
          placeholder="your.email@example.com"
          placeholderTextColor="#94A3B8"
          value={formData.email}
          onChangeText={(text) =>
            handleInputChange(
              "email",
              text,
            )
          }
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

      {/* Phone */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Phone Number{" "}
          <Text style={styles.required}>
            *
          </Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.phone &&
              styles.inputError,
          ]}
          placeholder="0812345678"
          placeholderTextColor="#94A3B8"
          value={formData.phone}
          onChangeText={(text) =>
            handleInputChange(
              "phone",
              text,
            )
          }
          keyboardType="phone-pad"
          editable={!isLoading}
        />
        {errors.phone && (
          <Text
            style={styles.errorText}
          >
            {errors.phone}
          </Text>
        )}
      </View>

      {/* Grade */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Grade{" "}
          <Text style={styles.required}>
            *
          </Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.grade &&
              styles.inputError,
          ]}
          placeholder="e.g., 10, 11, 12"
          placeholderTextColor="#94A3B8"
          value={formData.grade}
          onChangeText={(text) =>
            handleInputChange(
              "grade",
              text,
            )
          }
          editable={!isLoading}
        />
        {errors.grade && (
          <Text
            style={styles.errorText}
          >
            {errors.grade}
          </Text>
        )}
      </View>

      {/* School */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          School Name{" "}
          <Text style={styles.required}>
            *
          </Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.school &&
              styles.inputError,
          ]}
          placeholder="Enter your school name"
          placeholderTextColor="#94A3B8"
          value={formData.school}
          onChangeText={(text) =>
            handleInputChange(
              "school",
              text,
            )
          }
          editable={!isLoading}
        />
        {errors.school && (
          <Text
            style={styles.errorText}
          >
            {errors.school}
          </Text>
        )}
      </View>

      {/* Parent/Guardian Name (Optional) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Parent/Guardian Name
          (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter parent/guardian name"
          placeholderTextColor="#94A3B8"
          value={formData.parentName}
          onChangeText={(text) =>
            handleInputChange(
              "parentName",
              text,
            )
          }
          editable={!isLoading}
        />
      </View>

      {/* Parent/Guardian Phone (Optional) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Parent/Guardian Phone
          (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="0812345678"
          placeholderTextColor="#94A3B8"
          value={formData.parentPhone}
          onChangeText={(text) =>
            handleInputChange(
              "parentPhone",
              text,
            )
          }
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        style={[
          styles.submitBtn,
          isLoading &&
            styles.submitBtnDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#fff"
          />
        ) : (
          <Text
            style={styles.submitBtnText}
          >
            Submit Registration
          </Text>
        )}
      </Pressable>

      {/* Terms */}
      <Text style={styles.terms}>
        By submitting this form, you
        agree to our Terms of Service
        and confirm that you meet the
        eligibility requirements.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
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
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  terms: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 16,
    textAlign: "center",
  },
});
