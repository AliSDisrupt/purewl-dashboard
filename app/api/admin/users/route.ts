import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getUserByEmail, getUserById, getAllUsers, updateUserRole } from "@/lib/storage/users";

export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check role from storage (MongoDB or file), not just session (session might be stale)
    const userEmail = session.user.email;
    const userId = session.user.id;
    
    let userData = null;
    if (userEmail) {
      userData = await getUserByEmail(userEmail);
    }
    if (!userData && userId) {
      userData = await getUserById(userId);
    }
    
    const isAdmin = userData?.role === 'admin' || session.user?.email === 'admin@orion.local' || session.user?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check role from storage (MongoDB or file), not just session (session might be stale)
    const userEmail = session.user.email;
    const userId = session.user.id;
    
    let userData = null;
    if (userEmail) {
      userData = await getUserByEmail(userEmail);
    }
    if (!userData && userId) {
      userData = await getUserById(userId);
    }
    
    const isAdmin = userData?.role === 'admin' || session.user?.email === 'admin@orion.local' || session.user?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { userId: targetUserId, role } = await request.json();
    
    if (!targetUserId || !role || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // Try to find user by ID or email (from DB or file)
    const users = await getAllUsers();
    const targetUser = users.find(u => u.id === targetUserId || u.email === targetUserId);
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const success = await updateUserRole(targetUser.id, role);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error.message || 'Failed to update user role' }, { status: 500 });
  }
}
