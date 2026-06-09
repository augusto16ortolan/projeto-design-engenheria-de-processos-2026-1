import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppText from "./AppText";

export default function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={22} color="#424b5a" />
      </Pressable>

      <AppText numberOfLines={1} variant="title" style={styles.title}>
        {title}
      </AppText>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#eee8df",
  },
  title: {
    flex: 1,
    marginHorizontal: 14,
    textAlign: "center",
    fontSize: 22,
  },
  spacer: {
    width: 46,
    height: 46,
  },
});
