import { NextResponse } from "next/server";

/**
 * Standard API error response. Use in route handlers for consistent shape
 * and to avoid leaking stack traces in production.
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: unknown
) {
  const body: { error: string; details?: unknown } = { error: message };
  if (details != null && process.env.NODE_ENV === "development") {
    body.details = details instanceof Error ? details.message : details;
  }
  return NextResponse.json(body, { status });
}
