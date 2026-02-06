import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { upsertUser, trackLogin } from "@/lib/storage/users";

export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get IP and user agent from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Create or update user (MongoDB or file)
    // Use email as ID if no ID is provided (for Google OAuth users)
    const userId = session.user.id || session.user.email || `user-${Date.now()}`;
    const isAdmin = session.user.email === 'admin@orion.local' || session.user.id === 'admin';
    
    console.log('[Track Login] Saving user:', {
      id: userId,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isAdmin,
    });
    
    const userData = await upsertUser({
      id: userId,
      email: session.user.email,
      name: session.user.name || session.user.email?.split('@')[0] || 'Unknown User',
      role: session.user.role || (isAdmin ? 'admin' : 'user'),
    });
    
    console.log('[Track Login] User saved:', {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    });
    
    // Track login
    await trackLogin(userData.id, ip, userAgent);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking login:", error);
    return NextResponse.json({ error: error.message || 'Failed to track login' }, { status: 500 });
  }
}
