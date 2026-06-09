import { StyleSheet, Text } from "react-native";

const variants = {
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#20242c",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#69707d",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20242c",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: "#20242c",
  },
  muted: {
    fontSize: 15,
    lineHeight: 21,
    color: "#69707d",
  },
  button: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  link: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d7d59",
  },
};

export default function AppText({
  children,
  style,
  variant = "body",
  ...props
}) {
  return (
    <Text style={[styles.base, variants[variant], style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
  },
});
