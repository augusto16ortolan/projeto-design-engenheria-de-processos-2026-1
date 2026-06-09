import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppText from "../../components/AppText";
import { useAuth } from "../../context/AuthContext";
import { useCustomAlert } from "../../context/CustomAlertContext";

export default function RegisterScreen({ navigation }) {
  const { loading, register } = useAuth();
  const { showAlert } = useCustomAlert();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      await register(name, email, password);
    } catch (error) {
      showAlert({
        title: "Não foi possível registrar",
        message: error.message,
        type: "warning",
      });
    }
  }

  return (
    <View style={styles.container}>
      <AppText variant="title">Criar conta</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Cadastre-se para gerenciar seus produtos.
      </AppText>

      <AppInput
        icon="person"
        onChangeText={setName}
        placeholder="Nome"
        value={name}
      />
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
        icon="person-add-alt"
        onPress={handleRegister}
        title={loading ? "Criando..." : "Registrar"}
      />

      <AppButton
        icon="arrow-back"
        onPress={() => navigation.replace("Login")}
        style={styles.secondaryButton}
        title="Voltar ao login"
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
  secondaryButton: {
    marginTop: 18,
  },
});
