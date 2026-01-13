import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getUserByEmail, getUserById } from "@/lib/storage/users";

export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const userId = session.user.id;
    
    // Try to get user from storage
    let userData = null;
    if (userEmail) {
      userData = getUserByEmail(userEmail);
    }
    if (!userData && userId) {
      userData = getUserById(userId);
    }
    
    if (userData) {
      return NextResponse.json({ role: userData.role });
    }
    
    // Fallback to session role
    return NextResponse.json({ role: session.user.role || 'user' });
  } catch (error: any) {
    console.error("Error getting user role:", error);
    return NextResponse.json({ error: error.message || 'Failed to get user role' }, { status: 500 });
  }
}
