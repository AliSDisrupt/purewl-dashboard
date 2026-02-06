/**
 * GET /api/insights/aggregate
 * Phase 1: Returns aggregated GTM data (ClaudeInput shape) from GA4, HubSpot, LinkedIn, Reddit.
 * Use this to verify the data layer before wiring Claude (Phase 2).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { aggregateInsightsData } from "@/lib/insights/aggregate";
import { apiError } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await aggregateInsightsData();
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to aggregate insights data", 500, error);
  }
}
