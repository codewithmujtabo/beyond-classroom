import { AppInput } from "@/components/common/AppInput";
import { Brand } from "@/constants/theme";
import { useUser } from "@/context/AuthContext";
import * as usersService from "@/services/users.service";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const { user, fetchUser } = useUser();

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);

  // User fields
  const [fullName, setFullName] = useState((user as any)?.fullName || "");
  const [phone, setPhone] = useState((user as any)?.phone || "");
  const [email, setEmail] = useState((user as any)?.email || "");
  const [city, setCity] = useState((user as any)?.city || "");
  const [photoUrl, setPhotoUrl] = useState((user as any)?.photoUrl || null);

  // Student details
  const [dateOfBirth, setDateOfBirth] = useState((user as any)?.dateOfBirth || "");
  const [interests, setInterests] = useState((user as any)?.interests || "");
  const [referralSource, setReferralSource] = useState((user as any)?.referralSource || "");
  const [studentCardUrl, setStudentCardUrl] = useState((user as any)?.studentCardUrl || null);

  // School details
  const [schoolName, setSchoolName] = useState((user as any)?.schoolName || "");
  const [grade, setGrade] = useState((user as any)?.grade || "");
  const [npsn, setNpsn] = useState((user as any)?.npsn || "");
  const [schoolAddress, setSchoolAddress] = useState((user as any)?.schoolAddress || "");
  const [schoolEmail, setSchoolEmail] = useState((user as any)?.schoolEmail || "");
  const [schoolWhatsapp, setSchoolWhatsapp] = useState((user as any)?.schoolWhatsapp || "");
  const [schoolPhone, setSchoolPhone] = useState((user as any)?.schoolPhone || "");

  // Supervisor details
  const [supervisorName, setSupervisorName] = useState((user as any)?.supervisorName || "");
  const [supervisorEmail, setSupervisorEmail] = useState((user as any)?.supervisorEmail || "");
  const [supervisorWhatsapp, setSupervisorWhatsapp] = useState((user as any)?.supervisorWhatsapp || "");
  const [supervisorPhone, setSupervisorPhone] = useState((user as any)?.supervisorPhone || "");
  const [supervisorSchoolId, setSupervisorSchoolId] = useState((user as any)?.supervisorSchoolId || "");

  // Parent details
  const [parentName, setParentName] = useState((user as any)?.parentName || "");
  const [parentOccupation, setParentOccupation] = useState((user as any)?.parentOccupation || "");
  const [parentWhatsapp, setParentWhatsapp] = useState((user as any)?.parentWhatsapp || "");
  const [parentPhone, setParentPhone] = useState((user as any)?.parentPhone || "");
  const [parentSchoolId, setParentSchoolId] = useState((user as any)?.parentSchoolId || "");

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploadingPhoto(true);
      try {
        const { photoUrl: newUrl } = await usersService.uploadPhoto(uri);
        setPhotoUrl(newUrl);
        Alert.alert("Sukses", "Foto profil berhasil diubah");
      } catch (err: any) {
        Alert.alert("Error", err.message || "Gagal upload foto");
      } finally {
        setUploadingPhoto(false);
      }
    }
  }

  async function handlePickStudentCard() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploadingCard(true);
      try {
        const { studentCardUrl: newUrl } = await usersService.uploadStudentCard(uri);
        setStudentCardUrl(newUrl);
        Alert.alert("Sukses", "Kartu pelajar berhasil diupload");
      } catch (err: any) {
        Alert.alert("Error", err.message || "Gagal upload kartu pelajar");
      } finally {
        setUploadingCard(false);
      }
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert("Error", "Nama lengkap wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await usersService.updateProfile({
        fullName,
        phone,
        city,
        dateOfBirth: dateOfBirth || undefined,
        interests: interests || undefined,
        referralSource: referralSource || undefined,
        schoolName: schoolName || undefined,
        grade: grade || undefined,
        npsn: npsn || undefined,
        schoolAddress: schoolAddress || undefined,
        schoolEmail: schoolEmail || undefined,
        schoolWhatsapp: schoolWhatsapp || undefined,
        schoolPhone: schoolPhone || undefined,
        supervisorName: supervisorName || undefined,
        supervisorEmail: supervisorEmail || undefined,
        supervisorWhatsapp: supervisorWhatsapp || undefined,
        supervisorPhone: supervisorPhone || undefined,
        supervisorSchoolId: supervisorSchoolId || undefined,
        parentName: parentName || undefined,
        parentOccupation: parentOccupation || undefined,
        parentWhatsapp: parentWhatsapp || undefined,
        parentPhone: parentPhone || undefined,
        parentSchoolId: parentSchoolId || undefined,
      });

      await fetchUser((user as any)?.id);
      Alert.alert("Sukses", "Profil berhasil diperbarui", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  const initial = fullName.charAt(0).toUpperCase() || "?";
  const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") || "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profil</Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoWrapper}
            onPress={handlePickPhoto}
            disabled={uploadingPhoto}
          >
            {photoUrl ? (
              <Image
                source={{ uri: `${API_BASE}${photoUrl}` }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>{initial}</Text>
              </View>
            )}
            {uploadingPhoto && (
              <View style={styles.photoLoading}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {/* Student Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          <AppInput
            label="Nama Lengkap"
            placeholder="Nama lengkap"
            value={fullName}
            onChangeText={setFullName}
          />
          <AppInput
            label="Tanggal Lahir"
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
          <AppInput
            label="WhatsApp / Phone Number"
            placeholder="08xxx or +628xxx"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <AppInput
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />
          <AppInput
            label="Interest (comma-separated)"
            placeholder="e.g., Math, Science, Arts"
            value={interests}
            onChangeText={setInterests}
          />
          <AppInput
            label="Referral"
            placeholder="Bagaimana kamu tahu KompetiApp?"
            value={referralSource}
            onChangeText={setReferralSource}
          />
        </View>

        {/* Student Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kartu Pelajar</Text>
          {studentCardUrl ? (
            <View style={styles.cardPreview}>
              <Image
                source={{ uri: `${API_BASE}${studentCardUrl}` }}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.uploadBtn, uploadingCard && styles.uploadBtnDisabled]}
            onPress={handlePickStudentCard}
            disabled={uploadingCard}
          >
            {uploadingCard ? (
              <ActivityIndicator color={Brand.primary} size="small" />
            ) : (
              <Text style={styles.uploadBtnText}>
                {studentCardUrl ? "Ganti Kartu Pelajar" : "Upload Kartu Pelajar"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* School Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>School Details</Text>
          <AppInput
            label="School Name"
            placeholder="Nama sekolah"
            value={schoolName}
            onChangeText={setSchoolName}
          />
          <AppInput
            label="NPSN"
            placeholder="Nomor Pokok Sekolah Nasional"
            value={npsn}
            onChangeText={setNpsn}
            keyboardType="number-pad"
          />
          <AppInput
            label="Address"
            placeholder="Alamat sekolah"
            value={schoolAddress}
            onChangeText={setSchoolAddress}
          />
          <AppInput
            label="Email"
            placeholder="Email sekolah"
            value={schoolEmail}
            onChangeText={setSchoolEmail}
            keyboardType="email-address"
          />
          <AppInput
            label="WhatsApp"
            placeholder="WhatsApp sekolah"
            value={schoolWhatsapp}
            onChangeText={setSchoolWhatsapp}
            keyboardType="phone-pad"
          />
          <AppInput
            label="Phone Number"
            placeholder="Telepon sekolah"
            value={schoolPhone}
            onChangeText={setSchoolPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Supervisor Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supervisor Details</Text>
          <AppInput
            label="Name"
            placeholder="Nama supervisor"
            value={supervisorName}
            onChangeText={setSupervisorName}
          />
          <AppInput
            label="Email"
            placeholder="Email supervisor"
            value={supervisorEmail}
            onChangeText={setSupervisorEmail}
            keyboardType="email-address"
          />
          <AppInput
            label="WhatsApp"
            placeholder="WhatsApp supervisor"
            value={supervisorWhatsapp}
            onChangeText={setSupervisorWhatsapp}
            keyboardType="phone-pad"
          />
          <AppInput
            label="Phone Number"
            placeholder="Telepon supervisor"
            value={supervisorPhone}
            onChangeText={setSupervisorPhone}
            keyboardType="phone-pad"
          />
          <AppInput
            label="School ID"
            placeholder="ID sekolah supervisor"
            value={supervisorSchoolId}
            onChangeText={setSupervisorSchoolId}
          />
        </View>

        {/* Parent Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent Details</Text>
          <AppInput
            label="Name"
            placeholder="Nama orang tua"
            value={parentName}
            onChangeText={setParentName}
          />
          <AppInput
            label="Occupation"
            placeholder="Pekerjaan orang tua"
            value={parentOccupation}
            onChangeText={setParentOccupation}
          />
          <AppInput
            label="WhatsApp"
            placeholder="WhatsApp orang tua"
            value={parentWhatsapp}
            onChangeText={setParentWhatsapp}
            keyboardType="phone-pad"
          />
          <AppInput
            label="Phone Number"
            placeholder="Telepon orang tua"
            value={parentPhone}
            onChangeText={setParentPhone}
            keyboardType="phone-pad"
          />
          <AppInput
            label="School ID"
            placeholder="ID sekolah orang tua"
            value={parentSchoolId}
            onChangeText={setParentSchoolId}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 14, color: Brand.primary, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A" },

  photoSection: { alignItems: "center", marginBottom: 32 },
  photoWrapper: { position: "relative" },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Brand.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInitial: { fontSize: 40, fontWeight: "700", color: Brand.primary },
  photoLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8FAFC",
  },
  photoBadgeText: { fontSize: 14 },
  photoHint: { fontSize: 12, color: "#94A3B8", marginTop: 8 },

  section: { marginBottom: 24, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 4 },

  cardPreview: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardImage: { width: "100%", height: 200, borderRadius: 8 },

  uploadBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.primary,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { fontSize: 14, fontWeight: "600", color: Brand.primary },

  saveBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
