let currentUser = null;

const ADMIN_EMAIL = "admin@email.com";
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
  const normalizedEmail = email.trim().toLowerCase();
  const isAdmin = normalizedEmail === ADMIN_EMAIL;

  const user = {
    id: isAdmin ? "mock-admin-1" : "mock-user-1",
    name: isAdmin ? "Administrador" : normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: isAdmin ? USER_ROLES.ADMIN : USER_ROLES.COMMON,
  };

  currentUser = user;

  return mapUser(user);
}

export async function signUp(name, email, password) {
  if (!name?.trim()) {
    throw new Error("Informe seu nome.");
  }

  validateCredentials(email, password);

  const user = {
    id: `mock-user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: USER_ROLES.COMMON,
  };

  currentUser = user;

  return mapUser(user);
}

export async function signOut() {
  currentUser = null;

  return true;
}

export async function getCurrentUser() {
  return mapUser(currentUser);
}
