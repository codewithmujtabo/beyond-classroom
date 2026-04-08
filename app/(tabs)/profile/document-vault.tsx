import * as authService from "@/services/auth.service";
import * as documentService from "@/services/document.service";
import { Brand } from "@/constants/theme";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, {
    useEffect,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Document {
  id: string;
  doc_type: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

const DOC_TYPES = [
  {
    id: "id_card",
    label: "ID Card",
    icon: "🪪",
  },
  {
    id: "report_card",
    label: "Report Card",
    icon: "📄",
  },
  {
    id: "recommendation",
    label: "Recommendation Letter",
    icon: "💌",
  },
  {
    id: "certificate",
    label: "Certificate",
    icon: "🏆",
  },
  {
    id: "other",
    label: "Other Document",
    icon: "📎",
  },
];

export default function DocumentVaultScreen() {
  const insets = useSafeAreaInsets();
  const [documents, setDocuments] =
    useState<Document[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [uploading, setUploading] =
    useState(false);
  const [userId, setUserId] = useState<
    string | null
  >(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const userData = await authService.getMe();
      if (userData?.id) {
        setUserId(userData.id);
        await fetchDocuments();
      }
    } catch (err) {
      console.error(
        "Error initializing user:",
        err,
      );
      Alert.alert(
        "Error",
        "Failed to load documents",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await documentService.list();
      setDocuments(
        data.map((d) => ({
          id: d.id,
          doc_type: d.docType,
          file_name: d.fileName,
          file_size: d.fileSize,
          uploaded_at: d.uploadedAt,
        })),
      );
    } catch (err) {
      console.error(
        "Error fetching documents:",
        err,
      );
    }
  };

  const handlePickDocument =
    async () => {
      try {
        const result =
          await DocumentPicker.getDocumentAsync(
            {
              type: [
                "application/pdf",
                "image/*",
              ],
            },
          );

        if (
          !result.canceled &&
          result.assets[0]
        ) {
          showDocTypeSelector(
            result.assets[0],
          );
        }
      } catch (err) {
        Alert.alert(
          "Error",
          "Failed to pick document",
        );
        console.error(err);
      }
    };

  const handlePickImage = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker
                .MediaTypeOptions
                .Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          },
        );

      if (
        !result.canceled &&
        result.assets[0]
      ) {
        showDocTypeSelector({
          uri: result.assets[0].uri,
          name: `photo_${Date.now()}.jpg`,
          size:
            result.assets[0].width || 0,
        });
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to pick image",
      );
      console.error(err);
    }
  };

  const showDocTypeSelector = (
    fileAsset: any,
  ) => {
    Alert.alert(
      "Select Document Type",
      "What type of document is this?",
      DOC_TYPES.map((type) => ({
        text: type.label,
        onPress: () =>
          uploadDocument(
            fileAsset,
            type.id,
          ),
      })),
      { cancelable: true },
    );
  };

  const uploadDocument = async (
    fileAsset: any,
    docType: string,
  ) => {
    if (!userId) {
      Alert.alert(
        "Error",
        "User not found",
      );
      return;
    }

    setUploading(true);
    try {
      const fileName =
        fileAsset.name ||
        `${docType}_${Date.now()}`;
      const fileSize =
        fileAsset.size || 0;

      // In production, upload to your own file storage (S3, etc.)
      const fileUrl = `https://storage.example.com/${userId}/${fileName}`;

      await documentService.create({
        docType,
        fileName,
        fileSize,
        fileUrl,
      });

      Alert.alert(
        "Success",
        "Document uploaded!",
      );
      await fetchDocuments();
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to upload document",
      );
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (
    docId: string,
  ) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        {
          text: "Cancel",
          onPress: () => {},
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await documentService.remove(docId);

              Alert.alert(
                "Success",
                "Document deleted",
              );
              await fetchDocuments();
            } catch (err) {
              Alert.alert(
                "Error",
                "Failed to delete document",
              );
              console.error(err);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const getDocTypeLabel = (
    docType: string,
  ) => {
    return (
      DOC_TYPES.find(
        (t) => t.id === docType,
      )?.label || docType
    );
  };

  const getDocTypeIcon = (
    docType: string,
  ) => {
    return (
      DOC_TYPES.find(
        (t) => t.id === docType,
      )?.icon || "📎"
    );
  };

  const formatFileSize = (
    bytes: number,
  ) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(
      Math.log(bytes) / Math.log(k),
    );
    return (
      Math.round(
        (bytes / Math.pow(k, i)) * 100,
      ) /
        100 +
      " " +
      sizes[i]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={Brand.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 20,
          paddingBottom:
            insets.bottom + 24,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Document Vault
        </Text>
        <Text style={styles.subtitle}>
          Store documents you'll need
          for competition registrations
        </Text>
      </View>

      {/* Upload Options */}
      <View
        style={styles.uploadSection}
      >
        <Text
          style={styles.sectionTitle}
        >
          Add New Document
        </Text>
        <View
          style={styles.uploadButtons}
        >
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickDocument}
            disabled={uploading}
          >
            <Text
              style={
                styles.uploadButtonEmoji
              }
            >
              📄
            </Text>
            <Text
              style={
                styles.uploadButtonText
              }
            >
              Upload File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Text
              style={
                styles.uploadButtonEmoji
              }
            >
              📸
            </Text>
            <Text
              style={
                styles.uploadButtonText
              }
            >
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Documents List */}
      <View
        style={styles.documentsSection}
      >
        <Text
          style={styles.sectionTitle}
        >
          Your Documents (
          {documents.length})
        </Text>

        {documents.length === 0 ? (
          <View
            style={styles.emptyState}
          >
            <Text
              style={
                styles.emptyStateEmoji
              }
            >
              📭
            </Text>
            <Text
              style={
                styles.emptyStateText
              }
            >
              No documents yet
            </Text>
            <Text
              style={
                styles.emptyStateSubtext
              }
            >
              Upload documents to your
              vault for easy
              registration
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) =>
              item.id
            }
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={
                  styles.documentCard
                }
              >
                <View
                  style={
                    styles.documentIcon
                  }
                >
                  <Text
                    style={
                      styles.documentIconEmoji
                    }
                  >
                    {getDocTypeIcon(
                      item.doc_type,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.documentInfo
                  }
                >
                  <Text
                    style={
                      styles.documentType
                    }
                  >
                    {getDocTypeLabel(
                      item.doc_type,
                    )}
                  </Text>
                  <Text
                    style={
                      styles.documentName
                    }
                  >
                    {item.file_name}
                  </Text>
                  <Text
                    style={
                      styles.documentMeta
                    }
                  >
                    {formatFileSize(
                      item.file_size,
                    )}{" "}
                    •{" "}
                    {new Date(
                      item.uploaded_at,
                    ).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    handleDeleteDocument(
                      item.id,
                    )
                  }
                >
                  <Text
                    style={
                      styles.deleteButtonText
                    }
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoEmoji}>
          💡
        </Text>
        <Text style={styles.infoText}>
          Accepted formats: PDF, JPG,
          PNG (max 10MB each). Documents
          are encrypted and only visible
          to you and organizers you
          register with.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Brand.primary,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  uploadButtonEmoji: {
    fontSize: 32,
  },
  uploadButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.primary,
    textAlign: "center",
  },
  documentsSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor:
      Brand.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  documentIconEmoji: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.primary,
    marginBottom: 4,
  },
  documentName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 11,
    color: "#999",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "600",
  },
  infoBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoEmoji: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 12,
    color: "#1976d2",
    lineHeight: 16,
    flex: 1,
  },
});
