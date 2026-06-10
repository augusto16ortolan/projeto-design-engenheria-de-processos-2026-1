import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    setLoading(true);
    try {
      const response = await AsyncStorage.getItem(
        "@IntegrationCrud_userCredentials",
      );

      if (!response) {
        return;
      }

      const credentials = JSON.parse(response);
      await login(credentials.email, credentials.password);
    } catch (error) {
      console.log(
        "Ocorreu um erro ao autenticar automaticamente o usuário",
        error.message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true);

    try {
      const response = await authService.signIn(email, password);
      setUser(response.user);
      setToken(response.token);

      await AsyncStorage.setItem(
        "@IntegrationCrud_userCredentials",
        JSON.stringify({ email, password }),
      );

      return response.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);

    try {
      const response = await authService.signUp(name, email, password);
      setUser(response.user);
      setToken(response.token);

      await AsyncStorage.setItem(
        "@IntegrationCrud_userCredentials",
        JSON.stringify({ email, password }),
      );

      return response.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    try {
      await authService.signOut();
      await AsyncStorage.removeItem("@IntegrationCrud_userCredentials");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
