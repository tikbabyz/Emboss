// Mock auth helpers using localStorage (swap with real API later)
const USERS_KEY = "emboss_users";
const SESSION_KEY = "emboss_session";

const DEFAULT_ADMIN = {
  employeeId: "ADMIN",
  username: "admin",
  password: "admin1234",
  firstName: "Admin",
  lastName: "",
  department: "IT",
  role: "admin",
};

function getUsers() {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    // always keep admin in list
    if (!users.find((u) => u.username === "admin")) users.unshift(DEFAULT_ADMIN);
    return users;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({ employeeId, username, password, firstName, lastName, department }) {
  const users = getUsers();
  if (users.find((u) => u.username === username)) return { ok: false, error: "Username นี้ถูกใช้งานแล้ว" };
  if (users.find((u) => u.employeeId === employeeId)) return { ok: false, error: "รหัสพนักงานนี้ถูกใช้งานแล้ว" };
  users.push({ employeeId, username, password, firstName, lastName, department, role: "user" });
  saveUsers(users);
  return { ok: true };
}

export function loginUser(username, password) {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return { ok: false, error: "Username หรือ Password ไม่ถูกต้อง" };
  const session = { employeeId: user.employeeId, username: user.username, firstName: user.firstName, lastName: user.lastName, department: user.department, role: user.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, user: session };
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAllUsers() {
  return getUsers();
}

export function deleteUser(username) {
  if (username === "admin") return { ok: false, error: "ไม่สามารถลบ admin ได้" };
  const users = getUsers().filter((u) => u.username !== username);
  saveUsers(users);
  return { ok: true };
}

export function updateUser(username, { employeeId, firstName, lastName, department }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return { ok: false, error: "ไม่พบผู้ใช้งาน" };
  // check duplicate employeeId (exclude self)
  if (users.find((u) => u.employeeId === employeeId && u.username !== username))
    return { ok: false, error: "รหัสพนักงานนี้ถูกใช้งานแล้ว" };
  users[idx] = { ...users[idx], employeeId, firstName, lastName, department };
  saveUsers(users);
  return { ok: true };
}

export function resetPassword(username, newPassword) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return { ok: false, error: "ไม่พบผู้ใช้งาน" };
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return { ok: true };
}


