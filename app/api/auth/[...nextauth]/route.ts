import { handlers } from "@/lib/auth/config";

// Validate environment variables at runtime
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is missing! Authentication will not work.");
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("⚠️ NEXTAUTH_URL is not set. This may cause issues in production.");
}

export const { GET, POST } = handlers;
