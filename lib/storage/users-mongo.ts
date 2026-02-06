import connectDB from "@/lib/db/mongodb";
import UserModel, { IUser } from "@/lib/db/models/User";

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

function docToUser(doc: IUser): User {
  return {
    id: doc.id,
    email: doc.email,
    name: doc.name,
    role: doc.role as "admin" | "user",
    createdAt: doc.createdAt,
    lastLoginAt: doc.lastLoginAt,
    loginHistory: doc.loginHistory || [],
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (!process.env.MONGODB_URI) return undefined;
  await connectDB();
  const doc = await UserModel.findOne({ id }).lean().exec();
  return doc ? docToUser(doc as IUser) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (!process.env.MONGODB_URI) return undefined;
  await connectDB();
  const doc = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean().exec();
  return doc ? docToUser(doc as IUser) : undefined;
}

export async function getAllUsers(): Promise<User[]> {
  if (!process.env.MONGODB_URI) return [];
  await connectDB();
  const docs = await UserModel.find({}).sort({ createdAt: -1 }).lean().exec();
  return docs.map((d) => docToUser(d as IUser));
}

export async function upsertUser(
  user: Partial<User> & { id: string; email: string; name: string }
): Promise<User> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for user storage");
  }
  await connectDB();
  const email = user.email.toLowerCase().trim();
  
  // Try to find existing user by email first (for Google OAuth users who might have different IDs)
  let existing = await UserModel.findOne({ email }).exec();
  
  // If not found by email, try by ID
  if (!existing && user.id) {
    existing = await UserModel.findOne({ id: user.id }).exec();
  }

  if (existing) {
    // Update existing user - preserve ID if it exists, otherwise use the provided one
    if (user.id && existing.id !== user.id) {
      existing.id = user.id;
    }
    existing.name = user.name ?? existing.name;
    existing.email = email; // Ensure email is normalized
    if (user.role) existing.role = user.role as "admin" | "user";
    await existing.save();
    console.log(`[MongoDB] Updated user: ${existing.email} (${existing.id})`);
    return docToUser(existing);
  }

  // Create new user
  const newUser = await UserModel.create({
    id: user.id,
    email,
    name: user.name,
    role: user.role || "user",
    createdAt: user.createdAt || new Date().toISOString(),
    loginHistory: [],
  });
  console.log(`[MongoDB] Created new user: ${newUser.email} (${newUser.id})`);
  return docToUser(newUser);
}

const MIN_TIME_BETWEEN_LOGINS = 5 * 60 * 1000;

export async function trackLogin(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  await connectDB();
  const user = await UserModel.findOne({ id: userId }).exec();
  if (!user) return;

  const now = new Date();
  if (user.lastLoginAt) {
    const lastLoginTime = new Date(user.lastLoginAt);
    if (now.getTime() - lastLoginTime.getTime() < MIN_TIME_BETWEEN_LOGINS) {
      return;
    }
  }

  const loginEntry = {
    timestamp: now.toISOString(),
    ip,
    userAgent,
  };

  const history = user.loginHistory || [];
  history.unshift(loginEntry);

  const uniqueLogins: typeof history = [];
  for (const login of history) {
    const loginTime = new Date(login.timestamp);
    const isDuplicate = uniqueLogins.some((existing) => {
      const existingTime = new Date(existing.timestamp);
      return Math.abs(loginTime.getTime() - existingTime.getTime()) < MIN_TIME_BETWEEN_LOGINS;
    });
    if (!isDuplicate) uniqueLogins.push(login);
  }

  user.loginHistory = uniqueLogins.slice(0, 10);
  user.lastLoginAt = loginEntry.timestamp;
  await user.save();
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user"
): Promise<boolean> {
  if (!process.env.MONGODB_URI) {
    console.error("[updateUserRole] MONGODB_URI not defined");
    return false;
  }
  await connectDB();
  
  // Try to find user by id first, then by email as fallback
  let result = await UserModel.findOneAndUpdate(
    { id: userId },
    { role },
    { new: true }
  ).exec();
  
  // If not found by id, try by email
  if (!result) {
    result = await UserModel.findOneAndUpdate(
      { email: userId.toLowerCase().trim() },
      { role },
      { new: true }
    ).exec();
  }
  
  if (result) {
    console.log(`[updateUserRole] Successfully updated role for user ${result.id} (${result.email}) to ${role}`);
    return true;
  } else {
    console.error(`[updateUserRole] User not found: ${userId}`);
    return false;
  }
}
