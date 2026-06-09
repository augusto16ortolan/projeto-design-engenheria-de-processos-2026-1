import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppText from "../../components/AppText";
import { useAuth } from "../../context/AuthContext";
import { useCustomAlert } from "../../context/CustomAlertContext";

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const { showAlert } = useCustomAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await login(email, password);
    } catch (error) {
      showAlert({
        title: "Não foi possível entrar",
        message: error.message,
        type: "warning",
      });
    }
  }

  return (
    <View style={styles.container}>
      <AppText variant="title">Bem-vindo de volta!</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Entre para gerenciar produtos.
      </AppText>

      <AppInput
        autoCapitalize="none"
        icon="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="E-mail"
        value={email}
      />
      <AppInput
        icon="lock"
        isPassword
        onChangeText={setPassword}
        placeholder="Senha"
        value={password}
      />

      <AppButton
        disabled={loading}
        icon="login"
        onPress={handleLogin}
        title={loading ? "Entrando..." : "Entrar"}
      />

      <AppButton
        icon="person-add-alt"
        onPress={() => navigation.replace("Register")}
        style={styles.linkButton}
        title="Criar uma conta"
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f1ea",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  linkButton: {
    marginTop: 18,
  },
});
