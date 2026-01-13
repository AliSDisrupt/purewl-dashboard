import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAllUsers, updateUserRole } from "@/lib/storage/users";

export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user?.role !== 'admin' && session.user?.email !== 'admin@orion.local')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user?.role !== 'admin' && session.user?.email !== 'admin@orion.local')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { userId, role } = await request.json();
    
    if (!userId || !role || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const success = updateUserRole(userId, role);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error.message || 'Failed to update user role' }, { status: 500 });
  }
}
