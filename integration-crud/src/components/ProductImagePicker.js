import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import AppButton from "./AppButton";
import AppText from "./AppText";
import ProductImage from "./ProductImage";
import { useCustomAlert } from "../context/CustomAlertContext";

const pickerOptions = {
  allowsEditing: true,
  aspect: [4, 3],
  base64: true,
  mediaTypes: ["images"],
  quality: 0.8,
};

export default function ProductImagePicker({
  disabled = false,
  imageAsset,
  imageUrl,
  onRemoveImage,
  onSelectImage,
  productName,
}) {
  const { showAlert } = useCustomAlert();

  async function ensurePermission(type) {
    const permission =
      type === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      showAlert({
        title: "Permissao necessaria",
        message:
          type === "camera"
            ? "Permita o acesso a camera para fotografar o produto."
            : "Permita o acesso a galeria para escolher a imagem do produto.",
        type: "warning",
      });
      return false;
    }

    return true;
  }

  async function handlePickImage(type) {
    const hasPermission = await ensurePermission(type);

    if (!hasPermission) {
      return;
    }

    const result =
      type === "camera"
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    onSelectImage(result.assets[0]);
  }

  const previewUrl = imageAsset?.uri || imageUrl;

  return (
    <View style={styles.container}>
      <AppText variant="label">Imagem</AppText>

      <View style={styles.previewWrapper}>
        <ProductImage
          iconSize={40}
          name={productName || "Produto"}
          sourceUrl={previewUrl}
          style={styles.preview}
        />
      </View>

      <View style={styles.actions}>
        <AppButton
          disabled={disabled}
          icon="photo-camera"
          onPress={() => handlePickImage("camera")}
          style={styles.actionButton}
          title="Camera"
          variant="secondary"
        />
        <AppButton
          disabled={disabled}
          icon="photo-library"
          onPress={() => handlePickImage("library")}
          style={styles.actionButton}
          title="Galeria"
          variant="secondary"
        />
      </View>

      {previewUrl ? (
        <Pressable
          disabled={disabled}
          onPress={onRemoveImage}
          style={[styles.removeButton, disabled && styles.disabled]}
        >
          <MaterialIcons name="delete-outline" size={20} color="#b42318" />
          <AppText style={styles.removeText}>Remover imagem</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 16,
  },
  previewWrapper: {
    height: 190,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#ebe2d7",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 42,
  },
  removeText: {
    color: "#b42318",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.7,
  },
});
