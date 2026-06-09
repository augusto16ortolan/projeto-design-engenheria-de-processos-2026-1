import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppText from "./AppText";

const variants = {
  primary: {
    backgroundColor: "#2d7d59",
    color: "#ffffff",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#2d7d59",
  },
  secondary: {
    backgroundColor: "#f4f0ea",
    color: "#424b5a",
  },
  danger: {
    backgroundColor: "#b42318",
    color: "#ffffff",
  },
};

export default function AppButton({
  disabled = false,
  icon,
  iconColor,
  onPress,
  style,
  textStyle,
  title,
  variant = "primary",
}) {
  const isGhost = variant === "ghost";
  const variantStyles = variants[variant] ?? variants.primary;
  const color = iconColor ?? variantStyles.color;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: variantStyles.backgroundColor },
        isGhost && styles.ghostButton,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={color} /> : null}
      <AppText
        variant={isGhost ? "link" : "button"}
        style={[{ color }, textStyle]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    gap: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  ghostButton: {
    minHeight: 44,
  },
  disabled: {
    opacity: 0.7,
  },
});
