/**
 * GET /api/insights/latest
 * Returns the most recent insights from storage.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getLatestInsights } from "@/lib/insights/storage";
import { apiError } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = await getLatestInsights();
    if (!insights) {
      return NextResponse.json(
        { error: "No insights found. Run /api/insights/generate first." },
        { status: 404 }
      );
    }

    return NextResponse.json(insights);
  } catch (error) {
    return apiError("Failed to fetch latest insights", 500, error);
  }
}
