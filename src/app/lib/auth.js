import axios from "axios";

// Legacy users storage key (still used by admin local user utilities)
const USERS_KEY = "emboss_users";
// Session storage key used across the app
const SESSION_KEY = "emboss_session";

const AUTH_BASE_URL = (
  process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.NEXT_AUTH_API_URL || ""
).replace(/\/$/, "");
const AUTH_API = `${AUTH_BASE_URL}/api/auth`;

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

export async function registerUser({ employeeId, username, password, firstName, lastName, department }) {
  try {
    const parsedEmployeeId = Number.parseInt(employeeId, 10);

    await axios.post(`${AUTH_API}/register`, {
      employeeId: Number.isNaN(parsedEmployeeId) ? employeeId : parsedEmployeeId,
      username,
      password,
      firstName,
      lastName,
      department,
      section: department,
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error?.response?.data?.message || "เกิดข้อผิดพลาด",
    };
  }
}

export async function loginUser(username, password) {
  try {
    const response = await axios.post(`${AUTH_API}/login`, { username, password });
    const user = response?.data?.user;
    const token = response?.data?.token;

    if (!user) {
      return { ok: false, error: "ข้อมูลผู้ใช้จากระบบไม่ถูกต้อง" };
    }

    const session = {
      employeeId: user.employeeId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department || user.section || "",
      role: user.role || "user",
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (token) localStorage.setItem("token", token);

    return { ok: true, user: session };
  } catch (error) {
    return {
      ok: false,
      error: error?.response?.data?.message || "Username หรือ Password ไม่ถูกต้อง",
    };
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired()) {
      logout();
      return null;
    }

    const s = localStorage.getItem(SESSION_KEY);

    return s ? JSON.parse(s) : null;
  } catch {
    logout();
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("token");
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


export function isTokenExpired() {
  if (typeof window === "undefined") return true;

  try {
    const token = localStorage.getItem("token");

    if (!token) return true;

    const parts = token.split(".");

    // JWT ปกติจะมี 3 ส่วน
    if (parts.length !== 3) return true;

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/"),
      ),
    );

    if (!payload.exp) {
      return true;
    }

    const expireTime = payload.exp * 1000;

    return Date.now() >= expireTime;
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
}