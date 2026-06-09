import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppInput from "./AppInput";

function getQuantityValue(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  return Math.floor(numericValue);
}

export default function QuantityInput({ onChangeText, value }) {
  const quantity = getQuantityValue(value);

  function handleChangeText(text) {
    const onlyNumbers = text.replace(/\D/g, "");
    onChangeText(onlyNumbers);
  }

  function incrementQuantity() {
    const nextValue = quantity + 1;
    onChangeText(String(nextValue));
  }

  function decrementQuantity() {
    const nextValue = Math.max(quantity - 1, 0);
    onChangeText(String(nextValue));
  }

  return (
    <AppInput
      icon="inventory-2"
      keyboardType="numeric"
      label="Quantidade"
      onChangeText={handleChangeText}
      placeholder="0"
      rightElement={
        <View style={styles.actions}>
          <Pressable
            disabled={quantity === 0}
            hitSlop={8}
            onPress={decrementQuantity}
            style={[
              styles.actionButton,
              quantity === 0 && styles.disabledButton,
            ]}
          >
            <MaterialIcons name="remove" size={19} color="#2d7d59" />
          </Pressable>

          <Pressable
            hitSlop={8}
            onPress={incrementQuantity}
            style={styles.actionButton}
          >
            <MaterialIcons name="add" size={19} color="#2d7d59" />
          </Pressable>
        </View>
      }
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 6,
    marginRight: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#edf7f1",
  },
  disabledButton: {
    opacity: 0.45,
  },
});
