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

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
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
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
});
