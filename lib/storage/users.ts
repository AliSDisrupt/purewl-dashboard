import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  loginHistory: Array<{
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load users from file
export function loadUsers(): User[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Save users to file
export function saveUsers(users: User[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Get user by ID or email
export function getUserById(id: string): User | undefined {
  const users = loadUsers();
  return users.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const users = loadUsers();
  return users.find(u => u.email === email);
}

// Create or update user
export function upsertUser(user: Partial<User> & { id: string; email: string; name: string }): User {
  const users = loadUsers();
  const existing = users.find(u => u.id === user.id || u.email === user.email);
  
  if (existing) {
    // Update existing user
    Object.assign(existing, {
      ...user,
      loginHistory: existing.loginHistory || [],
    });
    saveUsers(users);
    return existing;
  } else {
    // Create new user
    const newUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      createdAt: user.createdAt || new Date().toISOString(),
      loginHistory: [],
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  }
}

// Track login - only track if last login was more than 5 minutes ago
export function trackLogin(userId: string, ip?: string, userAgent?: string): void {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (user) {
    const now = new Date();
    const MIN_TIME_BETWEEN_LOGINS = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Check if last login was recent (within 5 minutes)
    if (user.lastLoginAt) {
      const lastLoginTime = new Date(user.lastLoginAt);
      const timeSinceLastLogin = now.getTime() - lastLoginTime.getTime();
      
      // If last login was less than 5 minutes ago, don't track this as a new login
      if (timeSinceLastLogin < MIN_TIME_BETWEEN_LOGINS) {
        return; // Skip tracking this login
      }
    }
    
    const loginEntry = {
      timestamp: now.toISOString(),
      ip,
      userAgent,
    };
    
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift(loginEntry); // Add to beginning
    
    // Filter out duplicate logins that are too close together (within 5 minutes)
    const uniqueLogins: typeof user.loginHistory = [];
    for (const login of user.loginHistory) {
      const loginTime = new Date(login.timestamp);
      const isDuplicate = uniqueLogins.some(existing => {
        const existingTime = new Date(existing.timestamp);
        const timeDiff = Math.abs(loginTime.getTime() - existingTime.getTime());
        return timeDiff < MIN_TIME_BETWEEN_LOGINS;
      });
      
      if (!isDuplicate) {
        uniqueLogins.push(login);
      }
    }
    
    user.loginHistory = uniqueLogins.slice(0, 10); // Keep last 10 unique logins
    user.lastLoginAt = loginEntry.timestamp;
    
    saveUsers(users);
  }
}

// Update user role
export function updateUserRole(userId: string, role: 'admin' | 'user'): boolean {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (user) {
    user.role = role;
    saveUsers(users);
    return true;
  }
  return false;
}

// Get all users
export function getAllUsers(): User[] {
  return loadUsers();
}
