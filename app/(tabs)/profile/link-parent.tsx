import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brand } from "@/constants/theme";
import { inviteParent, getPendingInvitations, approveLink } from "@/services/parents.service";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LinkParentScreen() {
  const [parentEmail, setParentEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending invitations
  const { data: pendingInvitations, isLoading } = useQuery({
    queryKey: ["pendingInvitations"],
    queryFn: getPendingInvitations,
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: inviteParent,
    onSuccess: () => {
      Alert.alert("Success", "Invitation sent! Your parent will receive a PIN code via email.");
      setParentEmail("");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to send invitation");
    },
  });

  // Approve link mutation
  const approveLinkMutation = useMutation({
    mutationFn: ({ linkId, status }: { linkId: string; status: 'active' | 'rejected' }) =>
      approveLink(linkId, status),
    onSuccess: (_, variables) => {
      const message = variables.status === 'active'
        ? "Parent link approved!"
        : "Parent link rejected";
      Alert.alert("Success", message);
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update link");
    },
  });

  const handleSendInvitation = async () => {
    if (!parentEmail.trim()) {
      Alert.alert("Error", "Please enter your parent's email address");
      return;
    }

    if (!parentEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    sendInvitationMutation.mutate(parentEmail);
  };

  const handleApprove = (linkId: string) => {
    Alert.alert(
      "Approve Parent Link",
      "Are you sure you want to approve this parent account link?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => approveLinkMutation.mutate({ linkId, status: 'active' }),
        },
      ]
    );
  };

  const handleReject = (linkId: string) => {
    Alert.alert(
      "Reject Parent Link",
      "Are you sure you want to reject this parent account link?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => approveLinkMutation.mutate({ linkId, status: 'rejected' }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Brand.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Link Parent Account</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Invitation Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Invite Parent</Text>
          <Text style={styles.cardSubtitle}>
            Enter your parent's email address. They will receive a PIN code to link their account.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="parent@example.com"
            placeholderTextColor="#94A3B8"
            value={parentEmail}
            onChangeText={setParentEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!sendInvitationMutation.isPending}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              sendInvitationMutation.isPending && styles.sendButtonDisabled,
            ]}
            onPress={handleSendInvitation}
            disabled={sendInvitationMutation.isPending}
          >
            {sendInvitationMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send Invitation</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Pending Approvals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Approvals</Text>
          <Text style={styles.cardSubtitle}>
            Parents who have entered the PIN and are waiting for your approval
          </Text>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={Brand.primary} />
          ) : pendingInvitations && pendingInvitations.length > 0 ? (
            pendingInvitations.map((invite) => (
              <View key={invite.linkId} style={styles.inviteCard}>
                <View style={styles.inviteInfo}>
                  <Text style={styles.inviteName}>{invite.parentName}</Text>
                  <Text style={styles.inviteEmail}>{invite.parentEmail}</Text>
                  <Text style={styles.inviteDate}>
                    Requested: {new Date(invite.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(invite.linkId)}
                    disabled={approveLinkMutation.isPending}
                  >
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(invite.linkId)}
                    disabled={approveLinkMutation.isPending}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No pending approvals</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  placeholder: {
    width: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: Brand.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginTop: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  inviteEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  inviteDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  inviteActions: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
});
