import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppText from "./AppText";

export default function AppInput({
  icon,
  inputStyle,
  isPassword = false,
  label,
  multiline = false,
  rightElement,
  style,
  ...props
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const shouldHidePassword = isPassword && !isPasswordVisible;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View style={[styles.inputBox, multiline && styles.textAreaBox]}>
        {icon ? (
          <MaterialIcons
            name={icon}
            size={21}
            color="#69707d"
            style={[styles.leftIcon, multiline && styles.leftIconMultiline]}
          />
        ) : null}

        <TextInput
          multiline={multiline}
          placeholderTextColor="#aaa19a"
          secureTextEntry={shouldHidePassword}
          style={[styles.input, multiline && styles.textArea, inputStyle]}
          textAlignVertical={multiline ? "top" : "center"}
          {...props}
        />

        {isPassword ? (
          <Pressable
            hitSlop={10}
            onPress={() => setIsPasswordVisible((current) => !current)}
            style={styles.passwordButton}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={21}
              color="#69707d"
            />
          </Pressable>
        ) : (
          rightElement
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 7,
  },
  inputBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee4d8",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  textAreaBox: {
    minHeight: 104,
    alignItems: "flex-start",
  },
  leftIcon: {
    marginLeft: 14,
    marginRight: 9,
  },
  leftIconMultiline: {
    marginTop: 14,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    paddingRight: 14,
    color: "#20242c",
    fontSize: 16,
  },
  textArea: {
    minHeight: 102,
    paddingTop: 12,
  },
  passwordButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 48,
  },
});
