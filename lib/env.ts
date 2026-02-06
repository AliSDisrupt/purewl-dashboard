/**
 * Central env helpers and validation.
 * Required vars are validated when auth config loads (server-only).
 */

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}

export function getEnvVar(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  return stripQuotes(value);
}

export function getEnvVarRequired(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(
      `${key} is required. Please set it in your environment variables.`
    );
  }
  return value;
}

/** Validate required keys; throws with a clear message listing missing vars. */
export function validateRequiredEnv(keys: string[]): void {
  const missing = keys.filter((k) => !getEnvVar(k));
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Set them in .env.local or your deployment environment.`
    );
  }
}

/** Optional env vars used by the app (for documentation / optional validation). */
export const OPTIONAL_ENV = [
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "HUBSPOT_ACCESS_TOKEN",
  "HUBSPOT_API_BASE",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_ADMIN_KEY",
  "MONGODB_URI",
  "ADMIN_PASSWORD",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_REFRESH_TOKEN",
] as const;
