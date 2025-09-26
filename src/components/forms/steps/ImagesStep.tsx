import { Button } from "@/src/components/common/Button";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface ImagesData {
  images: string[];
}

export interface ImagesStepProps {
  data: ImagesData;
  onChange: (data: Partial<ImagesData>) => void;
  errors?: { images?: string };
  testID?: string;
}

export const ImagesStep: React.FC<ImagesStepProps> = ({
  data,
  onChange,
  errors,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const images = data.images || [];
  const maxImages = 1; // Backend only supports single image
  const canAddMore = images.length < maxImages;

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library permissions are needed to add images.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        onChange({ images: newImages });
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        onChange({ images: newImages });
      }
    } catch {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newImages = images.filter((_, i) => i !== index);
          onChange({ images: newImages });
        },
      },
    ]);
  };

  const renderImageActions = () => (
    <View style={styles.imageActionsContainer}>
      <Button
        title="📷 Take Photo"
        onPress={handleTakePhoto}
        variant="secondary"
        style={styles.imageActionButton}
        disabled={!canAddMore}
        testID="take-photo-button"
      />
      <Button
        title="📁 Choose from Gallery"
        onPress={handlePickImage}
        variant="secondary"
        style={styles.imageActionButton}
        disabled={!canAddMore}
        testID="pick-image-button"
      />
    </View>
  );

  const renderImageGrid = () => {
    if (images.length === 0) {
      return (
        <View
          style={[
            styles.emptyImageContainer,
            {
              backgroundColor: Colors[theme].backgroundSecondary,
              borderColor: Colors[theme].border,
            },
          ]}
        >
          <IconSymbol
            name="camera"
            size={48}
            color={Colors[theme].textSecondary}
          />
          <Text style={[styles.emptyImageTitle, { color: Colors[theme].text }]}>
            Add a Product Image
          </Text>
          <Text
            style={[
              styles.emptyImageDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Photos help buyers see what they&apos;re getting
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.productImage} />
            <Pressable
              style={[
                styles.removeImageButton,
                { backgroundColor: Colors[theme].error },
              ]}
              onPress={() => handleRemoveImage(index)}
              testID={`remove-image-${index}`}
            >
              <IconSymbol name="trash" size={16} color="white" />
            </Pressable>
          </View>
        ))}

        {/* Add more placeholder - currently disabled due to backend limitation */}
        {false && canAddMore && (
          <Pressable
            style={[
              styles.addImageContainer,
              {
                backgroundColor: Colors[theme].backgroundSecondary,
                borderColor: Colors[theme].border,
              },
            ]}
            onPress={handlePickImage}
            testID="add-more-images"
          >
            <IconSymbol
              name="plus"
              size={32}
              color={Colors[theme].textSecondary}
            />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.stepTitle, { color: Colors[theme].text }]}>
            Add Product Images
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Great photos help your product stand out and attract more buyers.
            Add clear, well-lit images that showcase your product.
          </Text>
        </View>

        {/* Image Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Product Images ({images.length}/{maxImages})
          </Text>
          {renderImageGrid()}
        </View>

        {/* Image Actions */}
        {canAddMore && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Add Images
            </Text>
            {renderImageActions()}
          </View>
        )}

        {/* Error Display */}
        {errors?.images && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: Colors[theme].error + "10" },
            ]}
          >
            <Text style={[styles.errorText, { color: Colors[theme].error }]}>
              {errors.images}
            </Text>
          </View>
        )}

        {/* Skip Option */}
        <View
          style={[
            styles.skipContainer,
            { backgroundColor: Colors[theme].backgroundSecondary },
          ]}
        >
          <Text style={[styles.skipTitle, { color: Colors[theme].text }]}>
            Optional Step
          </Text>
          <Text
            style={[
              styles.skipDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            You can skip adding images now and add them later. However, products
            with images get 3x more views and inquiries.
          </Text>
        </View>

        {/* Validation Status */}
        <View
          style={[
            styles.validationContainer,
            {
              backgroundColor:
                images.length > 0
                  ? Colors[theme].success + "10"
                  : Colors[theme].warning + "10",
            },
          ]}
        >
          <Text
            style={[
              styles.validationText,
              {
                color:
                  images.length > 0
                    ? Colors[theme].success
                    : Colors[theme].warning,
              },
            ]}
          >
            {images.length > 0
              ? "✓ Product image added successfully"
              : "⚠ Consider adding at least one image for better visibility"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },

  // Empty State
  emptyImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyImageTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyImageDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
  },

  // Image Grid
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageContainer: {
    width: 150,
    height: 150,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  // Image Actions
  imageActionsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageActionButton: {
    flex: 1,
  },

  // Guidelines
  guidelinesContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  guidelinesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  guidelinesList: {
    gap: Spacing.sm,
  },
  guidelineItem: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },

  // Backend Note
  noteContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.info + "20",
  },
  noteTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },

  // Skip Option
  skipContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  skipTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  skipDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },

  // Error
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.error + "20",
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  // Validation
  validationContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  validationText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },
});

export default ImagesStep;
