import { createContext, useContext, useState } from "react";

import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);

    try {
      const signedUser = await authService.signIn(email, password);
      setUser(signedUser);
      return signedUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);

    try {
      const registeredUser = await authService.signUp(name, email, password);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
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
