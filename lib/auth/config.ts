import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Allowed email domains for Google OAuth
const ALLOWED_DOMAINS = ["purevpn.com", "puresquare.com", "disrupt.com"];

// Local admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "DisruptPartnerships2026!",
};

// Helper function to strip quotes from env vars (Railway sometimes adds quotes)
function getEnvVar(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  // Remove surrounding quotes if present
  return value.replace(/^["']|["']$/g, '');
}

// Validate required environment variables
const nextAuthSecret = getEnvVar("NEXTAUTH_SECRET");
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required. Please set it in your environment variables.");
}

const nextAuthUrl = getEnvVar("NEXTAUTH_URL");
if (!nextAuthUrl) {
  console.warn("⚠️ NEXTAUTH_URL is not set. This may cause issues in production.");
}

// Validate Google OAuth credentials
const googleClientId = getEnvVar("GOOGLE_CLIENT_ID");
const googleClientSecret = getEnvVar("GOOGLE_CLIENT_SECRET");

if (!googleClientId || !googleClientSecret) {
  console.warn("⚠️ Google OAuth credentials are missing. Google sign-in will not be available.");
}

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for Railway/production deployments
  providers: [
    // Google Provider (only if credentials are available)
    ...(googleClientId && googleClientSecret ? [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      })
    ] : []),
    // Credentials Provider (always available)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Check credentials
        if (
          credentials.username === ADMIN_CREDENTIALS.username &&
          credentials.password === ADMIN_CREDENTIALS.password
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: "admin@orion.local",
          };
        }

        return null; // Invalid credentials
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow local credentials login (no domain check)
      if (account?.provider === "credentials") {
        return true;
      }

      // For Google OAuth, check domain
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        const emailDomain = user.email.split("@")[1]?.toLowerCase();

        if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // Use token role - client-side components will check storage via API
        // This avoids Edge Runtime issues while still allowing role updates
        session.user.role = (token.role as 'admin' | 'user') || (session.user.email === 'admin@orion.local' ? 'admin' : 'user');
      }
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        // Determine role - admin@orion.local is always admin
        const isAdmin = user.email === 'admin@orion.local' || user.id === 'admin';
        token.role = isAdmin ? 'admin' : 'user';
      }
      
      // Note: Storage check removed from JWT callback because it runs in Edge Runtime
      // Role updates are checked in session callback which runs in Node.js runtime
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production" || nextAuthUrl?.startsWith("https://"),
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: nextAuthSecret,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
});
