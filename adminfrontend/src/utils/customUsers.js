const STORAGE_KEY = "customUsers";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export function getCustomUsers() {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomUsers(users) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function addCustomUser(user) {
  if (!user?.email) throw new Error("Email is required");
  if (!user?.password) throw new Error("Password is required");
  if (!user?.role) throw new Error("Role is required");

  const users = getCustomUsers();
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error("A user with this email already exists.");
  }

  const newUser = {
    id: Date.now(),
    name: user.name?.trim() || user.email,
    email: user.email.trim(),
    password: user.password,
    role: user.role.trim(),
    modules: user.modules || [],
  };

  const updated = [...users, newUser];
  saveCustomUsers(updated);

  return newUser;
}


