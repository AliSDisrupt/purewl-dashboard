import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Debug logging only when explicitly enabled (e.g. DEBUG_MIDDLEWARE=1)
  if (process.env.NODE_ENV === "production" && process.env.DEBUG_MIDDLEWARE === "1") {
    console.log("Middleware check:", {
      pathname,
      hasAuth: !!req.auth,
      url: req.url,
      origin: req.headers.get("origin"),
    });
  }
  
  // Allow unauthenticated Atlas chat in dev when x-atlas-test header is set (for scripts/test-atlas-api.js)
  if (
    pathname === "/api/claude/chat" &&
    process.env.NODE_ENV === "development" &&
    req.headers.get("x-atlas-test") === "1"
  ) {
    return NextResponse.next();
  }

  // Allow access to auth pages, API routes, and webhooks
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/mcp") ||  // Allow MCP API routes
    pathname.startsWith("/api/webhooks") ||  // Allow webhook endpoints (RB2B, etc.)
    pathname.startsWith("/api/rb2b") ||  // Allow RB2B visitor API
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Protect admin routes - only admins can access
  if (pathname.startsWith("/admin")) {
    const isAdmin = req.auth.user?.role === 'admin' || req.auth.user?.email === 'admin@orion.local';
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/mcp|api/webhooks|api/rb2b|auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
