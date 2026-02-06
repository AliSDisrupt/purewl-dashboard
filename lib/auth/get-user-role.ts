/**
 * Get user role from storage (MongoDB or file)
 * Used in Node.js runtime (API routes, session callbacks)
 * Uses dynamic imports to avoid Edge Runtime issues
 */

export async function getUserRoleFromStorage(
  email?: string | null,
  userId?: string | null
): Promise<'admin' | 'user' | null> {
  try {
    // Dynamic import to avoid Edge Runtime issues (fs, path, process.cwd)
    const { getUserByEmail, getUserById } = await import('@/lib/storage/users');
    
    let userData = null;
    if (email) {
      userData = await getUserByEmail(email);
    }
    if (!userData && userId) {
      userData = await getUserById(userId);
    }
    if (userData?.role) {
      return userData.role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role from storage:', error);
    return null;
  }
}
