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
    const isAdmin = session.user.email === 'admin@orion.local' || session.user.id === 'admin';
    const userData = await upsertUser({
      id: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      role: session.user.role || (isAdmin ? 'admin' : 'user'),
    });
    
    // Track login
    await trackLogin(userData.id, ip, userAgent);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking login:", error);
    return NextResponse.json({ error: error.message || 'Failed to track login' }, { status: 500 });
  }
}
