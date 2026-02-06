// Lazy imports to avoid Edge Runtime issues
// Check if we're in Edge Runtime (where Node.js APIs aren't available)
function isEdgeRuntime(): boolean {
  return (typeof (globalThis as any).EdgeRuntime !== 'undefined') || 
         (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge');
}

let fs: typeof import("fs") | null = null;
let path: typeof import("path") | null = null;

function getNodeModules() {
  // In Edge Runtime, these will fail - but we check before calling
  if (isEdgeRuntime()) {
    throw new Error("Cannot use file system in Edge Runtime");
  }
  if (!fs) fs = require("fs");
  if (!path) path = require("path");
  return { fs, path };
}

function getUsersFile(): string {
  if (isEdgeRuntime()) {
    throw new Error("Cannot access file system in Edge Runtime");
  }
  const { path } = getNodeModules();
  return path!.join(process.cwd(), "data", "users.json");
}

function ensureDataDir() {
  if (isEdgeRuntime()) {
    throw new Error("Cannot access file system in Edge Runtime");
  }
  const { fs, path } = getNodeModules();
  const dataDir = path!.join(process.cwd(), "data");
  if (!fs!.existsSync(dataDir)) {
    fs!.mkdirSync(dataDir, { recursive: true });
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  lastLoginAt?: string;
  loginHistory: Array<{
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

function loadUsersSync(): User[] {
  const { fs } = getNodeModules();
  ensureDataDir();
  const USERS_FILE = getUsersFile();
  if (!fs!.existsSync(USERS_FILE)) return [];
  try {
    const data = fs!.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveUsersSync(users: User[]): void {
  const { fs } = getNodeModules();
  ensureDataDir();
  const USERS_FILE = getUsersFile();
  fs!.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/** Use MongoDB when MONGODB_URI is set; otherwise fall back to file storage. */
async function useMongo(): Promise<boolean> {
  return !!process.env.MONGODB_URI;
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (isEdgeRuntime()) {
    // In Edge Runtime, always use MongoDB if available, otherwise return undefined
    if (process.env.MONGODB_URI) {
      const mongo = await import("@/lib/storage/users-mongo");
      return mongo.getUserById(id);
    }
    return undefined;
  }
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    return mongo.getUserById(id);
  }
  const users = loadUsersSync();
  return users.find((u) => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (isEdgeRuntime()) {
    // In Edge Runtime, always use MongoDB if available, otherwise return undefined
    if (process.env.MONGODB_URI) {
      const mongo = await import("@/lib/storage/users-mongo");
      return mongo.getUserByEmail(email);
    }
    return undefined;
  }
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    return mongo.getUserByEmail(email);
  }
  const users = loadUsersSync();
  return users.find((u) => u.email === email);
}

export async function getAllUsers(): Promise<User[]> {
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    const list = await mongo.getAllUsers();
    // One-time migration: if DB is empty but file has users, copy them over
    if (list.length === 0) {
      const fileUsers = loadUsersSync();
      if (fileUsers.length > 0) {
        for (const u of fileUsers) {
          await mongo.upsertUser({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: u.createdAt,
          });
        }
        return mongo.getAllUsers();
      }
    }
    return list;
  }
  return loadUsersSync();
}

export async function upsertUser(
  user: Partial<User> & { id: string; email: string; name: string }
): Promise<User> {
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    return mongo.upsertUser(user);
  }
  const users = loadUsersSync();
  const existing = users.find((u) => u.id === user.id || u.email === user.email);
  if (existing) {
    Object.assign(existing, {
      ...user,
      loginHistory: existing.loginHistory || [],
    });
    saveUsersSync(users);
    return existing;
  }
  const newUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    createdAt: user.createdAt || new Date().toISOString(),
    loginHistory: [],
  };
  users.push(newUser);
  saveUsersSync(users);
  return newUser;
}

export async function trackLogin(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    return mongo.trackLogin(userId, ip, userAgent);
  }
  const users = loadUsersSync();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  const now = new Date();
  const MIN = 5 * 60 * 1000;
  if (user.lastLoginAt && now.getTime() - new Date(user.lastLoginAt).getTime() < MIN) return;
  const loginEntry = { timestamp: now.toISOString(), ip, userAgent };
  user.loginHistory = user.loginHistory || [];
  user.loginHistory.unshift(loginEntry);
  const uniqueLogins: User["loginHistory"] = [];
  for (const login of user.loginHistory) {
    const t = new Date(login.timestamp).getTime();
    const isDup = uniqueLogins.some((e) => Math.abs(new Date(e.timestamp).getTime() - t) < MIN);
    if (!isDup) uniqueLogins.push(login);
  }
  user.loginHistory = uniqueLogins.slice(0, 10);
  user.lastLoginAt = loginEntry.timestamp;
  saveUsersSync(users);
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user"
): Promise<boolean> {
  if (await useMongo()) {
    const mongo = await import("@/lib/storage/users-mongo");
    return mongo.updateUserRole(userId, role);
  }
  const users = loadUsersSync();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.role = role;
  saveUsersSync(users);
  return true;
}
