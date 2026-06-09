import { createContext, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";

const CustomAlertContext = createContext(null);

const alertIcons = {
  warning: {
    name: "info-outline",
    color: "#b7791f",
    backgroundColor: "#fff7e6",
  },
  danger: {
    name: "error-outline",
    color: "#b42318",
    backgroundColor: "#fff0ed",
  },
  success: {
    name: "check-circle-outline",
    color: "#2d7d59",
    backgroundColor: "#edf7f1",
  },
};

export function CustomAlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState(null);

  function closeAlert() {
    const closeAction = alertConfig?.onClose;
    setAlertConfig(null);

    if (closeAction) {
      closeAction();
    }
  }

  function showAlert({
    title,
    message,
    type = "warning",
    buttonText = "Entendi",
    onClose,
  }) {
    setAlertConfig({
      title,
      message,
      type,
      buttonText,
      onClose,
      isConfirm: false,
    });
  }

  function dismissConfirm() {
    setAlertConfig(null);
  }

  function showConfirm({
    title,
    message,
    type = "danger",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
  }) {
    setAlertConfig({
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm,
      isConfirm: true,
    });
  }

  async function handleConfirm() {
    const confirmAction = alertConfig?.onConfirm;
    setAlertConfig(null);

    if (confirmAction) {
      await confirmAction();
    }
  }

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
    }),
    [],
  );

  const icon = alertIcons[alertConfig?.type] ?? alertIcons.warning;

  return (
    <CustomAlertContext.Provider value={value}>
      {children}

      <Modal
        animationType="fade"
        onRequestClose={closeAlert}
        transparent
        visible={Boolean(alertConfig)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Pressable
              hitSlop={10}
              onPress={alertConfig?.isConfirm ? dismissConfirm : closeAlert}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={22} color="#69707d" />
            </Pressable>

            <View
              style={[
                styles.iconContainer,
                { backgroundColor: icon.backgroundColor },
              ]}
            >
              <MaterialIcons name={icon.name} size={30} color={icon.color} />
            </View>

            <AppText variant="title" style={styles.title}>
              {alertConfig?.title}
            </AppText>
            <AppText variant="subtitle" style={styles.message}>
              {alertConfig?.message}
            </AppText>

            {alertConfig?.isConfirm ? (
              <View style={styles.actions}>
                <AppButton
                  onPress={dismissConfirm}
                  style={styles.actionButton}
                  title={alertConfig.cancelText}
                  variant="secondary"
                />

                <AppButton
                  onPress={handleConfirm}
                  style={styles.actionButton}
                  title={alertConfig.confirmText}
                  variant={alertConfig.type === "danger" ? "danger" : "primary"}
                />
              </View>
            ) : (
              <AppButton
                onPress={closeAlert}
                style={styles.singleButton}
                title={alertConfig?.buttonText}
              />
            )}
          </View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
}

export function useCustomAlert() {
  const context = useContext(CustomAlertContext);

  if (!context) {
    throw new Error(
      "useCustomAlert deve ser usado dentro de CustomAlertProvider.",
    );
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(32, 36, 44, 0.42)",
  },
  card: {
    width: "100%",
    padding: 22,
    paddingTop: 24,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee4d8",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#f4f0ea",
  },
  iconContainer: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
  },
  message: {
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  actionButton: {
    flex: 1,
  },
  singleButton: {
    width: "100%",
    marginTop: 22,
  },
});
