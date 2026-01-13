/**
 * Get user role from storage
 * This file is only used in Node.js runtime (API routes, session callbacks)
 */

import { getUserByEmail, getUserById } from '@/lib/storage/users';

export function getUserRoleFromStorage(email?: string | null, userId?: string | null): 'admin' | 'user' | null {
  try {
    let userData = null;
    
    if (email) {
      userData = getUserByEmail(email);
    }
    if (!userData && userId) {
      userData = getUserById(userId);
    }
    
    if (userData && userData.role) {
      return userData.role;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role from storage:', error);
    return null;
  }
}
