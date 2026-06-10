import api from "./api";

let currentUser = null;

const USER_ROLES = {
  ADMIN: "ADMIN",
  COMMON: "COMMON",
};

function mapUser(user) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    name: metadata.name ?? user.name ?? user.email,
    email: user.email,
    role: user.role ?? USER_ROLES.COMMON,
  };
}

function validateCredentials(email, password) {
  if (!email?.trim() || !password) {
    throw new Error("Informe e-mail e senha.");
  }

  if (!email.trim().includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }

  if (password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }
}

export async function signIn(email, password) {
  validateCredentials(email, password);
  const request = {
    email,
    password,
  };
  const response = await api.post("/auth/login", request);

  if (response.status != 200) {
    throw new Error("Ocorreu um erro ao fazer o login");
  }

  return {
    token: response.data.token,
    user: mapUser(response.data.user),
  };
}

export async function signUp(name, email, password) {
  if (!name?.trim()) {
    throw new Error("Informe seu nome.");
  }

  validateCredentials(email, password);

  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  if (response.status != 201) {
    throw new Error("Ocorreu um erro ao registrar o usuário");
  }

  return {
    token: response.data.token,
    user: mapUser(response.data.user),
  };
}

export async function signOut() {
  currentUser = null;

  return true;
}

export async function getCurrentUser() {
  return mapUser(currentUser);
}
